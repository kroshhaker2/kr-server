# Changelog

## [1.4.0](https://github.com/kroshhaker2/kr-server/compare/v1.3.0...v1.4.0) (2026-09-26)


### Features

* **tags:** Add tags endpoits ([d4ce6b7](https://github.com/kroshhaker2/kr-server/commit/d4ce6b7b56225f39272f5427f29334f515252bab))

## [1.3.0](https://github.com/kroshhaker2/kr-server/compare/v1.2.4...v1.3.0) (2026-09-26)


### Features

* **admin:** Add posts moderation ([bc86a29](https://github.com/kroshhaker2/kr-server/commit/bc86a29d313b138f3e76b5a85775fd80b1bfcc6b))
* **app:** Add PUT methods to CORS ([0a3e62f](https://github.com/kroshhaker2/kr-server/commit/0a3e62fa67d2f6ef787c6faa2e58c81ad38ba24e))
* **service/posts:** Add cleanup was incomplete ([6785ded](https://github.com/kroshhaker2/kr-server/commit/6785ded2ce585190160ce483a544c857c691f1e9))

## [1.2.4](https://github.com/kroshhaker2/kr-server/compare/v1.2.3...v1.2.4) (2026-09-24)


### Bug Fixes

* **depoy:** Fix env ([ca922ea](https://github.com/kroshhaker2/kr-server/commit/ca922ea6e30003bfc56dd50f433a1d7b046311ef))

## [1.2.3](https://github.com/kroshhaker2/kr-server/compare/v1.2.2...v1.2.3) (2026-09-24)


### Bug Fixes

* Env MINIO to S3 ([97413fe](https://github.com/kroshhaker2/kr-server/commit/97413fef96298101f46b124d9921e467082024c0))

## [1.2.2](https://github.com/kroshhaker2/kr-server/compare/v1.2.1...v1.2.2) (2026-09-24)


### Bug Fixes

* Fix vitest ([16d34ae](https://github.com/kroshhaker2/kr-server/commit/16d34ae17ec428b6b9d7d9b32cce6f4defe851e2))

## [1.2.1](https://github.com/kroshhaker2/kr-server/compare/v1.2.0...v1.2.1) (2026-09-24)


### Bug Fixes

* Add env to deploy pipeline ([095022c](https://github.com/kroshhaker2/kr-server/commit/095022c6a557789a1dbd7426d66e3ecd898ce19d))
* Fix env to deploy pipeline ([1aa3757](https://github.com/kroshhaker2/kr-server/commit/1aa375744a3f18f5e100f6e5a6ac28d8c470bb2c))

## [1.2.0](https://github.com/kroshhaker2/kr-server/compare/v1.1.2...v1.2.0) (2026-09-24)


### Features

* add post get & create ([c81220e](https://github.com/kroshhaker2/kr-server/commit/c81220e6b77b92050841aca874be1c3696dc2dcd))

## [1.1.2](https://github.com/kroshhaker2/kr-server/compare/v1.1.1...v1.1.2) (2026-09-14)


### Bug Fixes

* add CORS env ([a7d7f73](https://github.com/kroshhaker2/kr-server/commit/a7d7f73cae422cda9e05a8aed6c6a8b44a51926c))

## [1.1.1](https://github.com/kroshhaker2/kr-server/compare/v1.1.0...v1.1.1) (2026-09-14)


### Bug Fixes

* add token to release-please workflow ([2278719](https://github.com/kroshhaker2/kr-server/commit/2278719e6d9629e267346eec75f535b73423fb08))

## [1.1.0](https://github.com/kroshhaker2/kr-server/compare/v1.0.0...v1.1.0) (2026-09-14)


### Features

* add CORS env ([6441b75](https://github.com/kroshhaker2/kr-server/commit/6441b759ccce00552fa9b4ecd7ca3961972e4f60))

## 1.0.0 (2026-09-13)


### Features

* add eslint check ([8e14f6d](https://github.com/kroshhaker2/kr-server/commit/8e14f6d68f6c9ce8c99a4a8e8627d292a888aab4))
* **auth:** add auth routes and authenticate guard ([75b8aca](https://github.com/kroshhaker2/kr-server/commit/75b8aca1b53b811372d12374d9f59d22f870f64d))
* **auth:** implement user, session and auth services ([688c7db](https://github.com/kroshhaker2/kr-server/commit/688c7db175b5302333bfa2c5b8d02adcea18d0d3))
* **core:** add config, shared types, prisma plugin and generated client ([d2b1461](https://github.com/kroshhaker2/kr-server/commit/d2b146118216b7aa6a5d8e5a329de5acc5eb61b9))
* **db:** add prisma schema and migrations ([67f4d83](https://github.com/kroshhaker2/kr-server/commit/67f4d83d9edbc7a1fa9e416d7b254b2e48b3322b))
* **db:** add seed script ([c2040b6](https://github.com/kroshhaker2/kr-server/commit/c2040b61814d9df405b62a431b513a669de12721))
* **posts:** add posts listing route with tag filtering ([a7fc293](https://github.com/kroshhaker2/kr-server/commit/a7fc29305a7247e0e4d80f2b14813c5746b0a50c))
* remake deploy ([fa3a5d6](https://github.com/kroshhaker2/kr-server/commit/fa3a5d617bebbc5369f0d0f1d8e47489e7bd00cb))
* **server:** wire plugins, routes and global error handler ([58d17b6](https://github.com/kroshhaker2/kr-server/commit/58d17b6f4b979f3e819e684002a6db9ef87a7a4e))
* **test:** add vitest for test api ([dcf7dd6](https://github.com/kroshhaker2/kr-server/commit/dcf7dd6136bf7bdf34d2a748b797390c89a4301c))
* **test:** add vitest for test api ([8c1c6d3](https://github.com/kroshhaker2/kr-server/commit/8c1c6d300ea52483dbdaf733cd0d07acd26e6c17))


### Bug Fixes

* add chown for node_modules ([35dbb56](https://github.com/kroshhaker2/kr-server/commit/35dbb56dfa031bc5b7a0a50f46d69329644083ff))
* **db:** username is unique ([ac48b0c](https://github.com/kroshhaker2/kr-server/commit/ac48b0cdaf8af176a609ce8d0149d4edb07ca099))
* fix user.service & add ts types check ([08d9089](https://github.com/kroshhaker2/kr-server/commit/08d9089d545d2286bb3addd65e76e57f41b19da8))
* fixed env requirement for prisma in build ([37695d7](https://github.com/kroshhaker2/kr-server/commit/37695d7bc0e5720eb580cd762290156cc51ba60e))
