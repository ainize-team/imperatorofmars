# Imperator of Mars World Builder
World Builder 는 Genesis FOL 에 기반한 스토리를 생성할 수 있는 도구이다.

![main](./screenshot/0.main.png)
## Genesis FOL

[Genesis FOL](https://github.com/ainize-team/imperatorofmars/blob/main/fol/0_genesis_9d5c0ec6bd88c06ddf1f4e696fd338c9844fa74ecd5803c5665bf8475441b2a2.fol) 은 이야기의 가장 근본적인 법칙이다.

## Generate The Story
###
![1-1.Input text and Sign](./screenshot/1-1.input%20text%20and%20sign.png)
각 입력마다 FOL 에 따른 스토리가 생성되고, 지갑 서명으로 책임소재를 투명하게 관리한다. 
스토리 진행에 따라 상태는 새로운 FOL이 되며 DAG에 저장된다.

생성된 FOL로 PR을 생성하면, FOL의 정합성을 검증한다. 검증된 PR은 Merge가 가능해지고, Merge되면 FOL과 입력에 따른 스토리를 생성해 HTML로 자동배포된다. Check [Validate FOL](../validate-fol/README.md)
###
![1-2.Generate Node](./screenshot/1-2.generate%20node.png)
서명 및 FOL 검증이 완료되어 DAG에 저장된 노드는 Visualizer 에서 확인할 수 있다.

![1-3.DAG Data Graph](./screenshot/1-3.dag%20data%20graph.png)
연결할 노드를 선택한 뒤 prompt를 입력하면 똑같은 생성 프로세스를 거친 뒤 새로운 노드가 연결된다. 주황색 노드는 다음 스토리에 대한 추천 Prompt를 제시하며 클릭으로 간편하게 다음 FOL 생성할 수 있다.
