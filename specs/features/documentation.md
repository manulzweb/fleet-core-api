# Code Documentation Specification

## Objective

Define documentation standards for FleetCore using JSDoc and NestJS Swagger, minimizing redundant comments and taking advantage of the Swagger CLI plugin.

## 1. Language and conventions

- Write all code documentation in English.
- Use JSDoc for classes, methods, interfaces, and properties when additional context is useful.
- Keep documentation concise, precise, and consistent with the actual implementation.
- Explain intent, business rules, constraints, side effects, and non-obvious behavior rather than restating the code.
- Update documentation whenever behavior changes.
- Do not add redundant comments to self-explanatory code.
- Do not document trivial private methods, getters, or setters unless necessary.
- Never leave outdated or misleading documentation.

## 2. JSDoc

Use JSDoc to document public APIs and components whose purpose or behavior is not immediately clear.

Use the following tags when appropriate:

- `@param`: Explain parameters when their purpose or constraints are not obvious.
- `@returns`: Describe meaningful return behavior when the type alone is insufficient.
- `@throws`: Document relevant exceptions and the conditions that trigger them.
- `@example`: Provide examples when they improve understanding.
- `@deprecated`: Identify obsolete APIs and their recommended replacements.

Avoid redundant tags when TypeScript already communicates the information clearly.

Document important business rules and technical decisions when they cannot be understood from the implementation alone.

## 3. Swagger documentation

Use `@nestjs/swagger` to document HTTP endpoints and API contracts.

Controllers should use appropriate decorators, including:

- `@ApiTags()` to group endpoints.
- `@ApiOperation()` to describe endpoint behavior.
- `@ApiResponse()` or specific response decorators to document relevant HTTP responses.
- `@ApiBearerAuth()` for JWT-protected endpoints, consistent with the Swagger configuration.
- `@ApiParam()` for relevant path parameters.
- `@ApiQuery()` for relevant query parameters.
- `@ApiBody()` when an explicit request-body definition is necessary.
- `@ApiProperty()` and `@ApiPropertyOptional()` only when required by the Swagger plugin configuration or when explicit metadata is needed.

Document successful responses, relevant error responses, authentication requirements, and authorization constraints according to the existing API specifications.

Response schemas and status codes must match the actual implementation and the contracts defined in `specs/`.

## 4. Swagger CLI plugin

Take full advantage of the NestJS Swagger CLI plugin to reduce repetitive decorators and keep DTO documentation maintainable.

Configure the plugin in the NestJS CLI configuration according to the existing project setup.

Requirements:

- Use the plugin to infer DTO property metadata from TypeScript declarations and supported validation decorators.
- Use the configured DTO file suffix conventions, such as `.dto.ts`, where appropriate.
- Enable inferred descriptions and examples from comments when supported by the installed plugin version and configuration.
- Use concise property comments that the plugin can incorporate into generated Swagger schemas.
- Avoid adding `@ApiProperty()` to every DTO property when the plugin already generates the required metadata.
- Add explicit Swagger decorators only when inference is insufficient, incorrect, or requires additional schema metadata.
- Verify that optional properties, enums, arrays, nested DTOs, and validation constraints are represented correctly in the generated OpenAPI document.
- Do not assume that the plugin replaces runtime validation or authorization.

Keep the plugin configuration compatible with the installed NestJS and `@nestjs/swagger` versions. Consult the official documentation if configuration details are uncertain.

## 5. DTOs and validation

DTOs must use explicit TypeScript types and the appropriate `class-validator` decorators.

Documentation must accurately represent:

- Required and optional properties.
- Data types and formats.
- Relevant validation constraints.
- Enum values.
- Meaningful examples, where useful.

Swagger metadata describes the API contract; it does not replace runtime validation.

Do not duplicate validation rules solely for documentation purposes.

## 6. Code comments

Add comments only when they explain non-obvious behavior, business constraints, technical limitations, or decisions that would otherwise be difficult to understand.

Avoid comments that merely translate code into English.

Document important business rules when their rationale or consequences are not obvious from the implementation.

## 7. Acceptance criteria

- Relevant public APIs and non-obvious behavior have concise, accurate JSDoc documentation.
- API endpoints are documented using NestJS Swagger.
- The Swagger CLI plugin is configured and used to minimize repetitive DTO decorators.
- Generated schemas correctly represent required fields, optional fields, enums, nested objects, and relevant constraints.
- Authentication, authorization, and relevant HTTP responses are documented.
- Documentation matches the actual implementation and the existing specifications.
- No redundant, outdated, or contradictory comments are introduced.
- Documentation changes do not alter application behavior.