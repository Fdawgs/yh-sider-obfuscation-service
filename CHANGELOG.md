## <small>2.2.3 (2021-01-14)</small>

-   fix(server): set referrer policy with fallback ([7567f0a](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/7567f0a))
-   style(server): rename plugin variable ([6b8d7d2](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/6b8d7d2))
-   chore: disable cors in template ([4a7c671](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/4a7c671))

## <small>2.2.2 (2021-01-12)</small>

-   build(deps): bump fastify-disablecache from 1.0.0 to 1.0.1 (#78) ([79fad03](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/79fad03)), closes [#78](https://github.com/Fdawgs/ydh-sider-obfuscation-service/issues/78)
-   chore: add metadata to api schema ([a4f9d56](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/a4f9d56))
-   chore: add tags ([47c9af1](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/47c9af1))
-   ci: remove redundant javascript dictionary ([1ca5375](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/1ca5375))
-   test: set resetmocks option in jest config ([46e63b4](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/46e63b4))
-   fix(routes): correct schema to be nullable string ([4ff507a](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/4ff507a))

## <small>2.2.1 (2021-01-11)</small>

-   fix(env): set default cors to wildcard as boolean option broken ([1699db1](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/1699db1))
-   fix(server): add form-action csp directive ([026733f](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/026733f))
-   fix(server): disable caching ([f93470b](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/f93470b))

## 2.2.0 (2021-01-11)

-   build: add typoci config file ([7b795a4](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/7b795a4))
-   build(deps-dev): bump eslint-plugin-jsdoc from 30.7.13 to 31.0.1 (#72) ([fe27d17](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/fe27d17)), closes [#72](https://github.com/Fdawgs/ydh-sider-obfuscation-service/issues/72)
-   build(deps-dev): bump nodemon from 2.0.6 to 2.0.7 (#71) ([bfd35fc](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/bfd35fc)), closes [#71](https://github.com/Fdawgs/ydh-sider-obfuscation-service/issues/71)
-   build(deps): bump fastify-helmet from 5.0.3 to 5.1.0 (#74) ([a15119f](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/a15119f)), closes [#74](https://github.com/Fdawgs/ydh-sider-obfuscation-service/issues/74)
-   build(deps): bump pino from 6.9.0 to 6.10.0 (#73) ([6c466ac](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/6c466ac)), closes [#73](https://github.com/Fdawgs/ydh-sider-obfuscation-service/issues/73)
-   feat(routes): add healthcheck route ([bc56c06](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/bc56c06))
-   style: rename fastifyplugin variable to fp ([10a5aa4](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/10a5aa4))
-   refactor: ignore trailing slash service-wide ([b6d8223](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/b6d8223))
-   refactor(plugins): move plugins back to src/plugins; add secured context ([5f727f4](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/5f727f4))
-   refactor(server): use helmet default csp directives function ([30bc29e](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/30bc29e))
-   docs(readme): update yarn link ([6439fea](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/6439fea))

## <small>2.1.2 (2021-01-05)</small>

-   fix(server): set missing content-security-policy directives ([26a3eea](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/26a3eea))

## <small>2.1.1 (2021-01-05)</small>

-   refactor(routes/redirect): use fluent schema validation ([ae152e1](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/ae152e1))
-   test(server): remove benchmarking from unit tests ([0cc8249](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/0cc8249))
-   chore: remove leftover commented over code ([8097336](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/8097336))
-   chore: remove test https cert and key from `.env.template` ([c6d6b41](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/c6d6b41))

## 2.1.0 (2021-01-03)

-   build(deps-dev): bump eslint from 7.16.0 to 7.17.0 (#63) ([a289575](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/a289575)), closes [#63](https://github.com/Fdawgs/ydh-sider-obfuscation-service/issues/63)
-   build(deps-dev): bump eslint-plugin-jsdoc from 30.7.9 to 30.7.12 (#64) ([b24c32f](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/b24c32f)), closes [#64](https://github.com/Fdawgs/ydh-sider-obfuscation-service/issues/64)
-   refactor(routes/redirect): add route-specific plugins under route dir ([9866253](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/9866253))
-   refactor(routes/redirect): remove plugin registration ([2bca5b7](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/2bca5b7))
-   ci: fix caching of node dependencies ([4539c1d](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/4539c1d))
-   ci: use yarn cache of node dependencies if present ([6f6b316](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/6f6b316))
-   ci(codeql): specify more query suites ([023d178](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/023d178))
-   feat(routes/docs): add basic swagger documentation route ([d2e15e2](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/d2e15e2))
-   style(routes/redirect): rename function ([39c4f48](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/39c4f48))
-   style(server): chain register functions ([4049848](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/4049848))

## <small>2.0.1 (2020-12-31)</small>

-   build(deps): bump pino from 6.8.0 to 6.9.0 (#58) ([7cdfa13](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/7cdfa13)), closes [#58](https://github.com/Fdawgs/ydh-sider-obfuscation-service/issues/58)
-   build(docker): fix log directory ([ca3ea87](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/ca3ea87))
-   chore: remove old .env files from gitignore ([007cef9](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/007cef9))
-   chore(scripts): add `start:dev` dev script ([85aaeb3](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/85aaeb3))
-   docs(readme): add ydh logo ([b26b180](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/b26b180))
-   docs(readme): recommend docker usage over pm2 ([fc0f749](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/fc0f749))
-   fix(pm2): config file script ([f004e7a](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/f004e7a))
-   test(config): cover cors origin string; add ssl/pfx checks ([e0dcbeb](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/e0dcbeb))
-   test(config): cover ssl/pfx error branches ([c57f736](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/c57f736))
-   refactor: replace custom-env and cross-env with dotenv ([ddf1447](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/ddf1447))
-   refactor(config): throw error rather than log ([18003d2](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/18003d2))
-   style(routes/redirect): use full declaration method ([77eb02d](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/77eb02d))

## 2.0.0 (2020-12-30)

-   docs(contributing): update prettier script ([1141bf7](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/1141bf7))
-   docs(readme): correct output reference ([d0875d8](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/d0875d8))
-   build: update github-actions and docker with dependabot ([6923ddd](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/6923ddd))
-   build(deps-dev): remove jsinspect ([e2e25ff](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/e2e25ff))
-   build(deps): add env-schema ([ea3b6a1](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/ea3b6a1))
-   build(deps): add fluent-json-schema ([fe6e47a](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/fe6e47a))
-   build(deps): bump brpaz/hadolint-action from v1.2.1 to v1.3.1 ([e08c026](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/e08c026))
-   build(deps): bump fastify/github-action-merge-dependabot (#51) ([f5e49b1](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/f5e49b1)), closes [#51](https://github.com/Fdawgs/ydh-sider-obfuscation-service/issues/51)
-   build(docker): declare log_rotation_filename env variable ([1e3b646](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/1e3b646))
-   refactor(config): make fs calls async ([bd33e14](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/bd33e14))
-   refactor(plugins/keycloak): change `option` param handling ([ed5be5a](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/ed5be5a))
-   refactor(plugins/obfuscate): change `option` param handling ([b6ac30c](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/b6ac30c))
-   refactor(routes): add redirect path ([2e05bb6](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/2e05bb6))
-   refactor(routes/wildcard): autoloads plugins ([669f626](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/669f626))
-   refactor(server): rename app to server; server now plugin ([2f20375](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/2f20375))
-   test: fix calling of `getconfig()` function ([b40bcb9](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/b40bcb9))
-   test(app): ignore app.js for coverage ([48a07ee](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/48a07ee))
-   chore: tidy jsdoc tags and eslint comments ([6507667](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/6507667))
-   fix(config): defaults ([696d0a6](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/696d0a6))
-   fix(config): location of `https` object ([b3fe4b4](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/b3fe4b4))
-   fix(config): log_rotation_filename default ([54b2bb7](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/54b2bb7))
-   feat(config): add config validation ([171430f](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/171430f))
-   ci: refactor `codeql-analysis.yml` ([a19272a](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/a19272a))
-   style(ci): tidy job names ([f6398a9](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/f6398a9))

### BREAKING CHANGE

-   env variables prefixed with `LOGGER_` changed to `LOG_`. `CORS_ALLOWED_HEADERS_ARRAY` and `CORS_METHODS_ARRAY` have been removed.
-   keycloak plugin function now expects `options.keycloak` not `options`
-   obfuscate plugin function now expects `options.obfuscate` not `options`
-   Redirect made to `/` must now be made to `/redirect`

## <small>1.1.2 (2020-12-28)</small>

-   docs: clarify on json schema validation ([e529595](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/e529595))
-   docs(readme): add missing backticks ([665767c](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/665767c))
-   docs(readme): add note about validation and serialisation ([6b1e865](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/6b1e865))
-   docs(readme): even more grammar tixes ([f35c97b](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/f35c97b))
-   docs(readme): grammar fixes ([958b4e5](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/958b4e5))
-   build(deps-dev): remove eslint-plugin-json ([addb15a](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/addb15a))
-   build(deps-dev): remove unused dev dependencies ([1bd730b](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/1bd730b))
-   build(deps): bump fastify-autoload from 3.3.1 to 3.4.0 ([f67e6a6](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/f67e6a6))
-   build(docker): bump docker-compose from 3.0 to 3.8 ([644cd3b](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/644cd3b))
-   build(docker): pin git version ([04c1437](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/04c1437))
-   ci: add docker test job ([42b8f3a](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/42b8f3a))
-   ci: add docker-compose test job ([3e4e9ad](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/3e4e9ad))
-   ci: add dockerfile lint job ([878378c](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/878378c))
-   ci: do not run github actions for draft prs ([6b8e8ca](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/6b8e8ca))
-   ci: temporarily disable docker test job ([edaf01a](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/edaf01a))
-   ci: use yarn `--frozen-lockfile` flag for repro deps ([7fbbc05](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/7fbbc05))
-   fix(docker): set `service_host` env variable ([05c052a](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/05c052a))
-   style: use default prettier options for trailing commas and quotes ([5c03f65](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/5c03f65))
-   chore: rename repo ([f9316f4](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/f9316f4))
-   chore(scripts): summarise count of dependency licenses ([94631f7](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/94631f7))
-   refactor(docker): remove redundant `if...else` statement ([594eae8](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/594eae8))

## <small>1.1.1 (2020-12-22)</small>

-   build(deps-dev): add autocannon ([e23a46f](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/e23a46f))
-   build(deps-dev): add license-checker ([78fb88c](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/78fb88c))
-   build(deps): bump axios from 0.21.0 to 0.21.1 ([0d6a9dd](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/0d6a9dd))
-   refactor(plugins): don't add prehandler hook if keycloak option disabled ([7249a9a](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/7249a9a))
-   refactor(plugins): remove object for mandatory param ([d95b7fe](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/d95b7fe))
-   refactor(routes): add regex patterns to validate query string params ([81fa44f](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/81fa44f))
-   test(app): add benchmark tests ([2b80124](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/2b80124))
-   test(app): query mock path instead of live path ([fcfa94d](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/fcfa94d))
-   test(app): query string param values schema validation ([62e8eed](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/62e8eed))
-   docs(readme): add acknowledgements section ([3a301a5](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/3a301a5))
-   docs(readme): add links to request builders ([6139927](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/6139927))
-   docs(readme): grammar fixes ([661280a](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/661280a))
-   chore: move test resources into dedicated folder ([c18408e](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/c18408e))
-   ci: add license-checker to lint job ([7bfda07](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/7bfda07))
-   tests(app): fix min and max random numbers ([8fa0abf](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/8fa0abf))

## 1.1.0 (2020-12-20)

-   chore: add stale confg ([4d8c099](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/4d8c099))
-   chore: remove duplicate install step ([a1d6ab0](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/a1d6ab0))
-   chore: update repository value ([80549ca](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/80549ca))
-   chore(package): update description ([cd77415](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/cd77415))
-   fix: adhere to `arrow-body-style` eslint rule ([f513c96](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/f513c96))
-   feat: add configurable cors ([334830d](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/334830d))
-   build(deps-dev): bump eslint from 7.14.0 to 7.16.0 ([b10c720](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/b10c720))
-   build(deps-dev): bump eslint-config-prettier from 6.15.0 to 7.1.0 ([d7436f9](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/d7436f9))
-   build(deps-dev): bump eslint-plugin-jsdoc from 30.7.8 to 30.7.9 ([082ec44](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/082ec44))
-   build(deps): bump fastify from 3.9.1 to 3.9.2 ([c2161a0](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/c2161a0))
-   build(deps): bump obfuscated-querystring from `72e3a4b` to `8c7c78e` ([f79e54b](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/f79e54b))
-   build(deps): bump pino from 6.7.0 to 6.8.0 ([b535a33](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/b535a33))
-   ci: add linting job; expand scope of jobs to all branches/commits besides docs (#36) ([635abff](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/635abff)), closes [#36](https://github.com/Fdawgs/ydh-sider-obfuscation-service/issues/36)
-   ci: automatically merge dependabot pull requests on pass build stage ([7c64508](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/7c64508))
-   ci: require lint job on automerge ([f7b9666](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/f7b9666))
-   docs(readme): clarify abbreviations ([c8c4d0f](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/c8c4d0f))

## <small>1.0.1 (2020-12-04)</small>

-   docs(readme): add motivation to intro ([cebdea6](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/cebdea6))
-   docs(readme): update deployment script ([af41310](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/af41310))
-   docs(readme): update run script ([87beab4](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/87beab4))
-   chore(env): update note on docker deployment ([82e5f8b](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/82e5f8b))
-   docs(readme): replace reference to expressjs ([d1d697b](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/d1d697b))
-   Revert "chore(scripts): set env for `start` script" ([71ef15e](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/71ef15e))

## 1.0.0 (2020-12-03)

-   feat(config): allow for logger to be enabled/disabled ([78d58e8](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/78d58e8))
-   test: add test ssl certs ([dca7c55](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/dca7c55))
-   test: add unit tests for plugins and route ([d9a65d3](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/d9a65d3))
-   test: disable logging for test instances ([595b635](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/595b635))
-   test: refine coverage collection paths ([59072bc](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/59072bc))
-   chore: suppress console warnings for tests ([90805b2](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/90805b2))
-   chore(scripts): set env for `start` script ([e91e914](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/e91e914))
-   refactor(plugins): log errors thrown by plugins ([4ab37e8](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/4ab37e8))
-   refactor(server): move code out of function ([f8be983](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/f8be983))

## 0.1.0 (2020-12-03)

-   build(deps-dev): bump dev dependencies ([56d2f81](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/56d2f81))
-   build(deps): bump fastify from 3.8.0 to 3.9.1 ([a4a2e48](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/a4a2e48))
-   chore: add security.md ([ab40c53](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/ab40c53))
-   chore: fix jsdoc return tag ([67089d1](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/67089d1))
-   chore: update jsdoc tags ([80fde55](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/80fde55))
-   refactor: replace console.log with pino logger usage ([e5c7162](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/e5c7162))
-   refactor: separate app and server code ([704f4fa](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/704f4fa))
-   refactor: use http-errors dep to generate http errors ([38e8856](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/38e8856))
-   refactor(app): autoload routes ([8dc9541](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/8dc9541))
-   refactor(app): directly export function ([372e5fd](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/372e5fd))
-   refactor(config): human readable log files; write to rotating files ([d0100a5](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/d0100a5))
-   refactor(plugin): move options check inside hook ([70a3198](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/70a3198))
-   refactor(route): remove trakcare query params causing ie 11 issues ([8008a27](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/8008a27))
-   refactor(services): replace middleware with schema-based validation ([da4b993](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/da4b993))
-   style: rename `service` path to `routes` ([246fecf](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/246fecf))
-   docs(readme): update contents ([e83f8da](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/e83f8da))
-   docs(security): remove backticks ([0fb297c](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/0fb297c))
-   test(app): add basic tests ([5f93891](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/5f93891))
-   feat(config): allow log rotation to be customised; tidy env var names ([4222979](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/4222979))
-   feat(config): allow obfuscation values to be customised ([0c69aee](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/0c69aee))
-   feat(services): enforce iso8601 date format ([0e8dc97](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/0e8dc97))
-   fix(config): check https files exist ([a4172d3](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/a4172d3))
-   fix(plugins): await second request ([370ac1c](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/370ac1c))

## <small>0.0.3 (2020-11-24)</small>

-   build(deps-dev): bump dev dependencies ([80fb5c9](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/80fb5c9))
-   build(deps): bump axios from 0.20.0 to 0.21.0 ([bc8fe23](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/bc8fe23))
-   build(deps): bump fastify from 3.5.1 to 3.8.0 ([9628820](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/9628820))
-   build(deps): bump fastify-plugin from 2.3.4 to 3.0.0 ([d61c9ad](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/d61c9ad))
-   build(deps): bump middie from 5.1.0 to 5.2.0 ([f8287f4](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/f8287f4))
-   build(deps): bump sanitize-middleware from 2.0.19 to 4.0.0 ([547670a](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/547670a))
-   build(docker): restrict mapped ports to localhost ([4d4d29e](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/4d4d29e))
-   ci: add aggregate coverage calculations ([baf2d13](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/baf2d13))
-   ci: clean up config ([66226cd](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/66226cd))
-   ci: name build stage ([4192e82](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/4192e82))
-   ci: replace travis-ci with github actions ([d69ee20](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/d69ee20))
-   docs(readme): add deploy steps and badges ([ec6ac51](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/ec6ac51))
-   style: format codeql.yml ([2f3a825](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/2f3a825))

## <small>0.0.2 (2020-10-09)</small>

-   build: create codeql-analysis.yml workflow file ([d55a014](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/d55a014))
-   build(deps-dev): bump dev dependencies ([a495dcd](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/a495dcd))
-   build(deps): bump fastify from 3.4.1 to 3.5.1 ([9be655e](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/9be655e))
-   build(deps): bump sanitize-middleware from 2.0.17 to 2.0.19 ([90a51d9](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/90a51d9))
-   build(docker): update system and dependencies ([0497f43](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/0497f43))
-   chore(github): add dependabot config ([22c8da3](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/22c8da3))
-   chore(github): add issue templates ([a0f06d8](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/a0f06d8))
-   chore(pm2): watch .env files for config changes; set instances to max ([795650d](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/795650d))
-   chore(scripts): remove nodemon script ([2385588](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/2385588))
-   fix(config): remove duplicate value ([c883666](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/c883666))
-   docs(contributing): correct release step order ([612e7f5](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/612e7f5))
-   docs(contributing): remove reference to replaced jest script ([4694e0b](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/4694e0b))
-   docs(contributing): spelling and grammar fixes ([eabd04a](https://github.com/Fdawgs/ydh-sider-obfuscation-service/commit/eabd04a))
