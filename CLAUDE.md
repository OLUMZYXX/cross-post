# CLAUDE.md — Project Development Rules

Claude must strictly follow the rules in this file before implementing any feature or writing any code.

---

## 1. File Compliance Rule

- Always read and follow CLAUDE.md before implementing anything.
- Do not ignore or override the rules in this file.
- If a request conflicts with these rules, follow this file first.

---

## 2. Code Style Rules

- Do NOT add comments inside the code.
- Write clean, self-explanatory code.
- Use clear variable and function names.
- Keep formatting consistent.
- Avoid unnecessary complexity.

---

## 3. File Length Rule

- A single file must NOT exceed 200 lines of code.
- If logic exceeds 200 lines:
  - Split into smaller modules.
  - Separate concerns properly.
  - Use reusable components or utilities.

---

## 4. Architecture Rules

- Follow modular architecture.
- Separate: Components, Services, Utilities, Config, Types.
- Do not mix business logic inside UI components.
- Keep API logic inside services.

---

## 5. Backend Rules (Node.js / Express)

- Use MVC structure: controllers, services, routes, models.
- Keep controllers thin.
- Move business logic to services.
- Validate input properly.
- Use environment variables for secrets.
- Never hardcode API keys.

---

## 6. Frontend Rules (React Native / Expo)

- Use functional components only.
- Use hooks properly.
- Keep components small and reusable.
- Extract reusable logic into custom hooks.
- Do not put API logic directly inside JSX.

---

## 7. Naming Conventions

- `camelCase` → variables and functions
- `PascalCase` → components
- `UPPERCASE` → constants
- File names should reflect their purpose.

---

## 8. Security Rules

- Never expose secret keys.
- Always validate user input.
- Sanitize data before saving to database.
- Use proper authentication flow.
- Follow best practices for API protection.

---

## 9. Performance Rules

- Avoid unnecessary re-renders.
- Use lazy loading where necessary.
- Optimize queries.
- Avoid duplicate logic.

---

## 10. Implementation Rule

Before writing any code, Claude must:

1. Analyze the task.
2. Break it into modules.
3. Ensure no file exceeds 200 lines.
4. Follow all rules above.

---

## 11. Error Handling

- Handle all async operations properly.
- Use try/catch where needed.
- Return structured error responses.
- Do not leak sensitive error details.

---

## 12. Scalability Rule

- Write code that can scale.
- Avoid tight coupling.
- Make features extendable.
