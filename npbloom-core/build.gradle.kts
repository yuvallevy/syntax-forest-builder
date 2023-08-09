plugins {
    kotlin("multiplatform") version "1.9.0"
}

group = "net.yuvsstuff"
version = "0.0.1"

repositories {
    mavenCentral()
}

kotlin {
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
            }
        }
        val commonTest by getting {
            dependencies {
                implementation(kotlin("test"))
            }
        }
    }
}

tasks.register("correctJsModuleExtension") {
    doLast {
        with(File("build/dist/js/productionLibrary/package.json")) {
            val correctedModuleName = readText().replace("npbloom-core.js", "npbloom-core.mjs")
            writeText(correctedModuleName)
        }
    }
}

tasks.named("build") {
    finalizedBy("correctJsModuleExtension")
}