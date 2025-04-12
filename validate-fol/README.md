# Validate FOL 프로세스

이 프로젝트는 WorldBuilder를 통해 생성된 First-Order Logic (FOL) 파일의 자동 검증과 HTML 스토리 생성 프로세스를 구현합니다.

## 프로세스 흐름

<img src="images/user_commit.png" alt="FOL 제출" style="border: 2px solid #ccc; padding: 10px; border-radius: 5px;">

1. **FOL 생성 및 제출**

   - 사용자가 WorldBuilder를 통해 자신만의 FOL을 생성합니다
   - 생성된 FOL을 제출합니다

<img src="images/validate-fol-action.png" alt="GitHub Actions 검증" style="border: 2px solid #ccc; padding: 10px; border-radius: 5px;">

2. **GitHub Actions 검증**

- 제출된 FOL은 자동으로 GitHub Actions 워크플로우를 통해 검증됩니다
  - [pull-request/route.ts](Dashboard/src/app/api/fol/pull-request/route.ts): PR 생성 및 관리
- 워크플로우는 다음 단계를 수행합니다:
  - FOL 파일의 문법 검사
  - FOL 파일의 의미론적 검증
  - 검증 결과를 PR에 코멘트로 추가
  - [validate-fol-pr.yml](.github/workflows/validate-fol-pr.yml): FOL 파일 검증 워크플로우

<img src="images/generate-html.png" alt="이야기 생성" style="border: 2px solid #ccc; padding: 10px; border-radius: 5px;">

3. **새로운 이야기 생성**

- FOL 검증에 통과하면 해당 FOL을 기반으로 새로운 이야기가 자동 생성됩니다
- 생성된 이야기는 HTML 형식으로 변환됩니다
- [commit-html/route.ts](Dashboard/src/app/api/fol/commit-html/route.ts): HTML 생성 및 커밋

<img src="images/merge-commit.png" alt="PR 머지" style="border: 2px solid #ccc; padding: 10px; border-radius: 5px;">

1. **구성원 합의 및 머지**

   - 새로운 이야기에 대해 구성원들이 검토하고 합의에 도달합니다
   - 합의가 이루어지면 main 브랜치에 머지됩니다

<img src="images/next-story-html.png" alt="HTML 배포" style="border: 2px solid #ccc; padding: 10px; border-radius: 5px;">

5. **자동 배포**
   - 머지된 이야기는 `https://imperatorofmars.ai/{**.html}`에 자동으로 배포됩니다
   - 각 FOL 파일에 대응하는 HTML 파일이 생성되어 스토리가 이어집니다

## 자동화된 프로세스

이 프로세스는 완전히 자동화되어 있으며, 사용자가 FOL을 제출하면 나머지 과정은 자동으로 진행됩니다. 각 단계에서 검증과 변환이 이루어져 최종적으로 HTML 형식의 스토리가 생성되고 배포됩니다.
