# Imperator of Mars: A Framework for Collaboratively Created Worlds with Provable Logical Consistency

## Problem

While Large Language Models (LLMs) have emerged as powerful tools in creative fields, issues like 'hallucination' and logical inconsistency limit their use in tasks requiring high fidelity. Additionally, large-scale collaborative projects involving multiple creators face challenges in maintaining content consistency, verifying contributions, and managing intellectual property (IP) rights.

## Solution: First-Order Logic is all you need.

Imperator of Mars is a proposed framework designed to address these problems. Its core technologies include:

1.  **First-Order Logic (FOL) Foundation:** Defines world rules and settings using mathematically precise First-Order Logic (FOL), eliminating ambiguity and providing a logical foundation.
2.  **Automated Consistency Verification:** When new creative content (story developments, setting additions, etc.) is proposed, FOL Agent automatically verifies if it conflicts with existing FOL rules. This prevents logical contradictions from entering the system.
3.  **Web3 Signature-Based Authorship Proof:** All contributions are submitted after being cryptographically signed with the creator's Web3 wallet private key. This provides immutable proof of who contributed what.
4.  **Story Protocol-Integrated IP Management:** Verified creative works can be registered as IP assets on the Story Protocol blockchain. This allows for transparent and automated management of IP ownership, licensing terms (Programmable IP Licenses), and royalty distribution for derivative works.

## Imperator of Mars Architecture

![Imperator of Mars Architecture](./images/imperator_of_mars_architecture.png)

### 1. World Builder Fronted

- **Dashboard**: view overall story contributions
- **FOL Rules**: list of logical assertions and formulas
- **DAG visualizer**: interactive DAG graph for contributing logic

---

### 2. 🤖 Agents

#### **World Builder Agent**
- Decides high-level direction and future events.
- Example FOL:
  ```
  ∃t (Year(t) ∧ t = 2027 ∧ PossibleTravel(Mars, Earth, t))
  ```

#### **FOL Writer Agent**
- Transforms natural exploration goals into FOL representation.
- Example FOL:
  ```
  ∃x ∃y ∃a ∃t (
    Exploration(y) ∧
    Agent(a) ∧
    Time(y, t) ∧
    Location(y, WaterIce) ∧
    FoundBy(a, x, y) ∧
    IsKryptoPlanet(x)
  )
  ```

#### **Fiction Writer Agent**
- Converts FOL into readable HTML fiction (Markdown, HTML).
- Outputs files like: `0_genesis.html`

---

### 3. GitHub

#### Files
- FOL logic files (e.g. `fol/0_genesis.fol`)
- Published stories (e.g. `docs/0_genesis.html`)

#### GitHub Actions
- Automatically runs `verifyFOL()` to validate logic.
- On success: merges contributions.

---

### 4. MCP Servers (Story Protocol)

### `story-mcp`
- Once a story milestone is reached (e.g. `IsKryptoPlanet(x)`), the asset can be:
  - Minted via `Mint KryptoPlanet`
  - Stored as onchain IP using **Story Protocol**

---

### 🌐 Deployment
👉 [https://imperatorofmars.ai](https://imperatorofmars.ai)
