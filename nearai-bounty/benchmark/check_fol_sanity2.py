import subprocess
import json
import re

# Helper function for parsing nested parentheses
def parse_predicate(line):
    stack, current, args = [], '', []
    predicate = ''

    for char in line:
        if char == '(':
            if not stack:
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
            args.append(current.strip())
            current = ''
        else:
            current += char

    return predicate, args


def fol_to_smt2(fol_str, filename):
    constants, predicates, assertions = set(), set(), []
    lines = fol_str.strip().split('\n')
    exist_statement = ''

    for line in lines:
        line = line.strip()
        if line.startswith('#') or not line:
            continue
        if '(' not in line and '∃' not in line:
            constants.add(line)
        elif '∃' in line:
            exist_statement = line
        else:
            predicate, args = parse_predicate(line)
            predicates.add((predicate, len(args)))
            assertions.append((predicate, args))

    with open(filename, 'w') as file:
        file.write('(declare-sort Object)\n')

        # Constants 선언
        for const in constants:
            file.write(f'(declare-const {const} Object)\n')
        file.write('\n')

        # Predicates 선언
        for pred, arg_count in predicates:
            args = ' '.join(['Object'] * arg_count)
            file.write(f'(declare-fun {pred} ({args}) Bool)\n')
        file.write('\n')

        # Assertions
        for pred, args in assertions:
            arg_str = ' '.join(args)
            file.write(f'(assert ({pred} {arg_str}))\n')
        file.write('\n')

        # 존재 양화자 문장 처리
        if exist_statement:
            match = re.search(r'∃\w*\s*\((.*)\)', exist_statement)
            if match:
                exist_content = match.group(1)
                file.write('(assert (exists ((x Object))\n')
                conditions = [cond.strip() for cond in exist_content.split('∧')]
                file.write('    (and\n')
                for cond in conditions:
                    file.write(f'        ({cond})\n')
                file.write('    )\n')

        # 정합성 확인
        file.write('\n(check-sat)\n(get-model)\n')


def check_consistency(smt_file):
    result = subprocess.run(['z3', smt_file], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    output = result.stdout.strip()
    return 'sat' in output

def fol_consistency_checker_from_json(input_json, output_json):
    with open(input_json, 'r') as infile:
        data = json.load(infile)

    results = []
    cnt_true = 0
    for item in data:
        fol_str = item['fol']
        smt_filename = 'temp_fol.smt2'
        fol_to_smt2(fol_str, smt_filename)
        is_consistent = check_consistency(smt_filename)
        print(f'is_consistent: {is_consistent}')
        if is_consistent:
            cnt_true += 1
        results.append({'fol': fol_str, 'is_consistent': is_consistent})
    total_cnt = len(data)
    print(f'cnt_true: {cnt_true}')
    print(f'total_cnt: {total_cnt}')
    print(f'cnt_true / total_cnt: {cnt_true / total_cnt:.2%}')
    # with open(output_json, 'w') as outfile:
    #     json.dump(results, outfile, indent=4)



# 예시 사용법
fol_consistency_checker_from_json('fol_results_v1.json', 'fol_consistency_results.json')
