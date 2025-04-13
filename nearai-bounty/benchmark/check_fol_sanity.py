import subprocess
import json
import re
import z3

# Helper function for parsing nested parentheses
def parse_predicate(line):
    """
    예) "LocatedOn(feature, planet)" -> ("LocatedOn", ["feature", "planet"])
    예) "IsPlanet(object)" -> ("IsPlanet", ["object"])
    """
    stack, current, args = [], '', []
    predicate = ''

    for char in line:
        if char == '(':
            if not stack:  # 스택이 비어있다면, 지금까지의 current는 술어(predicate) 이름
                predicate = current.strip()
                current = ''
            else:
                current += char
            stack.append(char)
        elif char == ')':
            stack.pop()
            if not stack:
                args.append(current.strip())
            else:
                current += char
        elif char == ',' and len(stack) == 1:
            # 최상위 괄호 한 단계에서의 ',' 는 인자 구분
            args.append(current.strip())
            current = ''
        else:
            current += char

    return predicate.strip(), args

def fol_to_smt2(fol_str, filename):
    """
    FOL 문자열을 받아서 SMT2 파일로 변환.
    - constants: 대문자로 시작한다고 가정 (Object 타입으로 선언)
    - 소문자로 시작하는 토큰은 임시로 sort 로 인식 (declare-sort)
    - predicate의 인자 역시 각각 (Object) 타입으로 선언.
    - assertion 시에는 (Predicate arg1 arg2 ...) 형태의 S-Expression 생성
      단, 소문자 인자는 "var"를 붙여 별도의 변수(symbol)처럼 처리
    """
    constants = set()           # 대문자로 시작하는 상수들 (e.g. Mars, Rover 등)
    predicates = dict()         # predicate -> [인자 sorts]
    assertions = []             # (predicate, [args]) 튜플 리스트
    sorts = set()               # (declare-sort) 해야 할 후보
    exist_statement = ''

    lines = fol_str.strip().split('\n')
    for line in lines:
        line = line.strip()
        if not line or line.startswith('#'):
            # 빈 줄 또는 주석은 무시
            continue

        # 단순히 상수(대문자)만 언급된 줄(괄호 없음) -> 예: Mars
        if '(' not in line and '∃' not in line:
            constants.add(line)
            continue

        # 존재 양화자 문장(∃)은 따로 저장
        if '∃' in line:
            exist_statement = line
            continue

        # 그 외: 일반적인 술어(predicate)
        predicate, args = parse_predicate(line)
        # 인자 타입 설정(소문자 시작이면 sort, 대문자면 Object)
        arg_sorts = []
        for arg in args:
            # arg가 소문자로 시작하면 sort 후보
            if arg and arg[0].islower():
                arg_sorts.append(arg)  # 예: planet, substance 등
                sorts.add(arg)
            else:
                # 대문자(또는 기타) -> 일단 Object로 처리
                arg_sorts.append('Object')
        predicates[predicate] = arg_sorts
        assertions.append((predicate, args))

    # SMT2 파일 생성
    with open(filename, 'w') as file:
        # 1. 필요한 sort 선언
        #    (declare-sort planet), (declare-sort substance) ...
        for s in sorted(sorts):
            file.write(f'(declare-sort {s})\n')
        file.write('\n')

        # 2. 상수 선언 (모두 Object 타입 가정)
        for const in sorted(constants):
            file.write(f'(declare-const {const} Object)\n')
        file.write('\n')

        # 3. 술어 선언
        #    (declare-fun IsPlanet (Object) Bool), (declare-fun LocatedOn (Object Object) Bool)
        for pred, arg_sorts in predicates.items():
            file.write(f'(declare-fun {pred} ({" ".join(arg_sorts)}) Bool)\n')
        file.write('\n')

        # 4. Assertion 작성
        #    (assert (IsPlanet Mars))
        #    (assert (LocatedOn feature_var planet_var))  ← 소문자 인자는 var를 붙여 심볼화
        for pred, args in assertions:
            processed_args = []
            for arg in args:
                if arg and arg[0].islower():
                    # 소문자 시작 -> 우리가 declare-sort 했으므로,
                    # 여기는 'sort'가 아니라 **그 sort를 가리키는 임의 변수**를 하나 쓴다고 가정
                    # (object_var) 처럼 괄호 쓰면 안 됨 → 그냥 object_var
                    processed_args.append(f'{arg}_var')
                else:
                    # 대문자 상수 그대로 사용
                    processed_args.append(arg)

            file.write(f'(assert ({pred} {" ".join(processed_args)}))\n')
        file.write('\n')

        # 5. 존재 양화자(∃) 처리 (단순 형식 가정)
        if exist_statement:
            match = re.search(r'∃\w*\s*\((.*)\)', exist_statement)
            if match:
                exist_content = match.group(1)
                conditions = [cond.strip() for cond in exist_content.split('∧')]
                file.write('(assert (exists ((x Object))\n')
                file.write('    (and\n')
                for cond in conditions:
                    file.write(f'        ({cond})\n')
                file.write('    )\n')
                file.write('))\n')
        file.write('\n(check-sat)\n(get-model)\n')


def check_consistency(smt_file):
    """
    생성된 SMT2를 Z3 파이썬 API로 로드하여 체크한다.
    parse_smt2_file 로드 시 구문오류나 선언오류가 있으면 Z3Exception 발생.
    """
    solver = z3.Solver()
    solver.add(z3.parse_smt2_file(smt_file))
    result = solver.check()
    print(f'[Z3] result = {result}')
    return result == z3.sat

def fol_consistency_checker_from_json(input_json, output_json):
    """
    JSON에 있는 { "fol": "..."} 형태 목록을 읽어 각 FOL식의 SAT 여부를 판별.
    결과를 새로운 JSON 파일로 저장.
    """
    with open(input_json, 'r') as infile:
        data = json.load(infile)

    results = []
    cnt_true = 0
    for item in data:
        fol_str = item['fol']
        smt_filename = 'temp_fol.smt2'

        # 1) FOL -> SMT2 변환
        fol_to_smt2(fol_str, smt_filename)

        # 2) Z3로 체크
        try:
            is_consistent = check_consistency(smt_filename)
        except z3.z3types.Z3Exception as e:
            # 구문 또는 선언 오류 발생 시 처리
            print(f'[Z3Exception] {e}')
            is_consistent = False

        print(f'FOL: {fol_str}')
        print(f'  => is_consistent: {is_consistent}')
        if is_consistent:
            cnt_true += 1
        results.append({'fol': fol_str, 'is_consistent': is_consistent})

    total_cnt = len(data)
    print(f'\n[Result] cnt_true: {cnt_true}')
    print(f'[Result] total_cnt: {total_cnt}')
    if total_cnt > 0:
        ratio = 100.0 * cnt_true / total_cnt
        print(f'[Result] ratio: {ratio:.2f}%\n')

    # 결과 JSON 저장
    with open(output_json, 'w') as outfile:
        json.dump(results, outfile, indent=4)

# ---------------------------
# 실제 사용 (예시):
fol_consistency_checker_from_json('fol_results_v4.json', 'fol_consistency_results.json')
