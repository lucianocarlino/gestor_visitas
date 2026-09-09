### Engineering Rules and Technical Standards (rules.md)

### 1. Technology Stack and Environment

* **Language:** Last TypeScript and Python
* **Main Framework:** React with NextJS and FastAPI
* **Dependency Manager:** npm

### 2. Paradigm and Architecture (Architecture Styles)

* **Paradigm:** Object-Oriented
* **Design Pattern:** Layers (Controller-Service-Repository)

### 3. Code Quality and Clean Code

* **Maximum Size:** No file should exceed 500 lines; no function/method should exceed 50 lines.

* **Single Responsibility:** Each function or module should solve exactly one well-defined task.

* * **Cognitive Complexity:** Avoid excessive nesting (maximum 2 levels of if/loops). Prefer guard clauses to return early in case of an error.

* **Typing:** Strict typing is mandatory. The use of evasive generic types such as any or unknown (in TypeScript) or Any (in Python) is strictly prohibited.

### 4. Error and Log Management (Error Handling)

* **Strategy:** The use of empty try/catch blocks is prohibited. Every captured error must be typed, handled, and transformed into a semantic domain exception.

* **Security Logs:** Do not log sensitive information such as credentials, passwords, authentication tokens, or personally identifiable information (PII) to the console or log files.
