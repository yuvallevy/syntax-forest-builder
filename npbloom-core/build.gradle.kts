plugins {
    kotlin("multiplatform") version "1.9.0"
    kotlin("plugin.serialization") version "1.9.0"
    id("maven-publish")
}

group = "space.yuvalinguist.npbloom"
version = "0.7.5"

repositories {
    mavenCentral()
}

kotlin {
    jvm()
    js(IR) {
        useEsModules()
        browser()
        binaries.library()
        generateTypeScriptDefinitions()
    }
    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation(kotlin("stdlib-js"))
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-cbor:1.6.0")
            }
        }
        val commonTest by getting {
            dependencies {
                implementation(kotlin("test"))
            }
        }
    }
}

tasks.register("patchKotlinJsBugs") {
    doLast {
        with(File("build/dist/js/productionLibrary/package.json")) {
            val correctedModuleName = readText().replace("npbloom-core.js", "npbloom-core.mjs")
            writeText(correctedModuleName)
        }
        with(File("build/dist/js/productionLibrary/npbloom-core.d.ts")) {
            val declarationsWithoutSyntaxErrors = readText().replace(
                """\s*static get Companion\(\):\s*\{\s*\}\s*&\s*any\/\* SerializerFactory \*\/;""".toRegex(), "")
            writeText(declarationsWithoutSyntaxErrors)
        }
    }
}

tasks.named("build") {
    finalizedBy("patchKotlinJsBugs")
}
