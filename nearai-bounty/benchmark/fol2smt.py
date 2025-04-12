# FOL to SMT-LIB (.smt2) 변환 Python 스크립트

# FOL 내용 (두번째 FOL)을 문자열로 입력받아 SMT-LIB 형식으로 변환합니다.

fol_content = """# First-Order Logic (FOL) Definition for Mark's Deployment to Mars
# Date: 2025-04-15

Mars
ImperatorOfMars
OlympusMons
VallesMarineris
GaleCrater
JezeroCrater
Perseverance
Curiosity
NorthPole
SouthPole
WaterIce
CarbonDioxide
Rock
Soil
Mark
Spacecraft

IsPlanet(object)
IsEntity(object)
IsMountain(object)
IsValley(object)
IsCrater(object)
IsRover(object)
IsPole(object)
IsSubstance(object)
IsRock(object)
IsSoil(object)
HasAtmosphere(planet)
IsFrozen(substance)
IsHuman(object)
IsSpacecraft(object)
LocatedOn(feature, planet)
LocatedIn(entity, location)
ExistsAt(substance, location)
PrimaryAtmosphericComponent(planet, substance)
TravelsTo(entity, destination)

IsPlanet(Mars)
IsEntity(ImperatorOfMars)
IsMountain(OlympusMons)
IsValley(VallesMarineris)
IsCrater(GaleCrater)
IsCrater(JezeroCrater)
IsRover(Perseverance)
IsRover(Curiosity)
IsPole(NorthPole)
IsPole(SouthPole)
IsSubstance(WaterIce)
IsSubstance(CarbonDioxide)
IsHuman(Mark)
IsSpacecraft(Spacecraft)
HasAtmosphere(Mars)
PrimaryAtmosphericComponent(Mars, CarbonDioxide)
IsFrozen(WaterIce)
LocatedOn(OlympusMons, Mars)
LocatedOn(VallesMarineris, Mars)
LocatedOn(GaleCrater, Mars)
LocatedOn(JezeroCrater, Mars)
LocatedOn(NorthPole, Mars)
LocatedOn(SouthPole, Mars)
LocatedIn(Perseverance, JezeroCrater)
LocatedIn(Curiosity, GaleCrater)
ExistsAt(WaterIce, NorthPole)
ExistsAt(WaterIce, SouthPole)
ExistsAt(CarbonDioxide, Mars)

∃x (IsHuman(x) ∧ TravelsTo(x, Mars) ∧ (x = Mark))"""


# SMT-LIB로 변환하여 파일로 저장하는 함수
def fol_to_smt2(fol_str, filename):
    constants, predicates, assertions = set(), set(), []
    lines = fol_str.strip().split('\n')

    for line in lines:
        line = line.strip()
        if line.startswith('#') or not line:
            continue
        if '(' not in line and '∃' not in line:
            constants.add(line)
        elif '(' in line and ')' in line and '∃' not in line:
            predicate, args = line.split('(')
            args = args[:-1].split(',')
            predicates.add((predicate.strip(), len(args)))
            assertions.append((predicate.strip(), [arg.strip() for arg in args]))
        elif '∃' in line:
            exist_statement = line

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
        file.write('(assert (exists ((x Object))\n')
        file.write('    (and (IsHuman x)\n')
        file.write('         (TravelsTo x Mars)\n')
        file.write('         (= x Mark))))\n')

        # 정합성 확인
        file.write('\n(check-sat)\n(get-model)\n')


# 함수 호출하여 SMT-LIB 파일 생성
fol_to_smt2(fol_content, 'mars_deployment.smt2')
