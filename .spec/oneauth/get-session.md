# getSession

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  version: 1.0.0
paths:
  /get-session:
    get:
      summary: getSession
      deprecated: false
      description: Get the current session
      operationId: getSession
      tags:
        - 测试环境/Default
        - Default
      parameters: []
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  session:
                    $ref: '#/components/schemas/Session'
                  user:
                    $ref: '#/components/schemas/User'
                required:
                  - session
                  - user
                x-apifox-orders:
                  - session
                  - user
                nullable: true
          headers: {}
          x-apifox-name: OK
          x-apifox-ordering: 0
        '400':
          description: >-
            Bad Request. Usually due to missing parameters, or invalid
            parameters.
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                required:
                  - message
                x-apifox-orders:
                  - message
          headers: {}
          x-apifox-name: Bad Request
          x-apifox-ordering: 1
        '401':
          description: Unauthorized. Due to missing or invalid authentication.
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                required:
                  - message
                x-apifox-orders:
                  - message
          headers: {}
          x-apifox-name: Unauthorized
          x-apifox-ordering: 2
        '403':
          description: >-
            Forbidden. You do not have permission to access this resource or to
            perform this action.
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                x-apifox-orders:
                  - message
          headers: {}
          x-apifox-name: Forbidden
          x-apifox-ordering: 3
        '404':
          description: Not Found. The requested resource was not found.
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                x-apifox-orders:
                  - message
          headers: {}
          x-apifox-name: Not Found
          x-apifox-ordering: 4
        '429':
          description: >-
            Too Many Requests. You have exceeded the rate limit. Try again
            later.
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                x-apifox-orders:
                  - message
          headers: {}
          x-apifox-name: Too Many Requests
          x-apifox-ordering: 5
        '500':
          description: >-
            Internal Server Error. This is a problem with the server that you
            cannot fix.
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                x-apifox-orders:
                  - message
          headers: {}
          x-apifox-name: Internal Server Error
          x-apifox-ordering: 6
      security: []
      x-apifox-folder: 测试环境/Default
      x-apifox-status: released
      x-run-in-apifox: https://app.apifox.com/web/project/7375195/apis/api-384020429-run
components:
  schemas:
    Session:
      type: object
      properties:
        id:
          type: string
        expiresAt:
          type: string
          format: date-time
        token:
          type: string
        createdAt:
          type: string
          format: date-time
          default: Generated at runtime
        updatedAt:
          type: string
          format: date-time
        ipAddress:
          type: string
        userAgent:
          type: string
        userId:
          type: string
        impersonatedBy:
          type: string
        activeOrganizationId:
          type: string
        activeTeamId:
          type: string
      required:
        - expiresAt
        - token
        - createdAt
        - updatedAt
        - userId
      x-apifox-orders:
        - id
        - expiresAt
        - token
        - createdAt
        - updatedAt
        - ipAddress
        - userAgent
        - userId
        - impersonatedBy
        - activeOrganizationId
        - activeTeamId
      x-apifox-ignore-properties: []
      x-apifox-folder: ''
    User:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        email:
          type: string
        emailVerified:
          type: boolean
          default: false
          readOnly: true
        image:
          type: string
        createdAt:
          type: string
          format: date-time
          default: Generated at runtime
        updatedAt:
          type: string
          format: date-time
          default: Generated at runtime
        role:
          type: string
          readOnly: true
        banned:
          type: boolean
          default: false
          readOnly: true
        banReason:
          type: string
          readOnly: true
        banExpires:
          type: string
          format: date-time
          readOnly: true
        lastLoginMethod:
          type: string
          readOnly: true
        inherentOrganizationId:
          type: string
          readOnly: true
        inherentTeamId:
          type: string
          readOnly: true
        metadata:
          type: json
        stripeCustomerId:
          type: string
      required:
        - name
        - email
        - createdAt
        - updatedAt
        - metadata
      x-apifox-orders:
        - id
        - name
        - email
        - emailVerified
        - image
        - createdAt
        - updatedAt
        - role
        - banned
        - banReason
        - banExpires
        - lastLoginMethod
        - inherentOrganizationId
        - inherentTeamId
        - metadata
        - stripeCustomerId
      x-apifox-ignore-properties: []
      x-apifox-folder: ''
  responses: {}
  securitySchemes:
    Combination:
      group:
        - id: 572232
        - id: 572233
      type: combination
servers:
  - url: https://oneauth.choiceform.io/v1/auth
    description: 测试环境
security:
  - Combination: []
    x-apifox:
      schemeGroups:
        - id: F0Hvqj-Nnp-mjGv2Gk0HI
          schemeIds:
            - Combination
      required: true
      use:
        id: F0Hvqj-Nnp-mjGv2Gk0HI
      scopes:
        F0Hvqj-Nnp-mjGv2Gk0HI:
          apiKeyCookie: []
          bearerAuth: []
```