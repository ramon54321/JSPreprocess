#!/usr/bin/env node
/*

    Examples

    //:include "./other.js" 

*/

// -- Chalk
const chalk = require("chalk")

// -- Declare Node FileSystem
const fs = require("fs")

// -- Opening debug
console.log()
console.log(chalk.green("[PREPROCESSING]"))

// -- Options object (Modified by arguments)
const options = {
    inputFile: "./index.js",
    outputFile: "./out.js",
}

// -- Read args and modify options
let argIndex = 0
let procArgs = process.argv.slice(2)
let argState = "none"
while (procArgs.length > argIndex) {
    const arg = procArgs[argIndex]
    // -- Set arg state
    if(arg.startsWith("-")) {
        argState = arg.slice(1)
    } 
    // -- Apply to state
    else {
        switch (argState) {
            case "none":
            case "i":
                options.inputFile = arg
                break;
            case "o":
                options.outputFile = arg
                break;
        }
    }
    argIndex++
}

// -- Debug options
console.log(chalk.green("\t" + options.inputFile + " -> " + options.outputFile))

// -- Load mutable source
let contents = fs.readFileSync(options.inputFile, {encoding: "utf8"}).trim()

// -- Maintain list of directives
const directives = []

// -- Regex for matching directives
const regex = /\/\/\:.*(\n|\r)/g;
do {
    // -- Match directives
    match = regex.exec(contents);
    if (match) {
        // -- Regex for matching args
        const argRegex = /"(.*?)"/g;
        // -- Maintain list of args
        const args = []
        do {
            // -- Regex for matching arg
            argMatch = argRegex.exec(match[0]);
            if (argMatch) {
                // -- Add arg to list
                args.push(argMatch[1])
            }
        } while (argMatch);

        // -- Create directive object
        const directive = {
            text: match[0],
            index: match.index,
            length: match[0].length,
            command: match[0].slice(3).split(/\s/)[0],
            args: args
        }
        // -- Add directive to list
        directives.push(directive)
    }
} while (match);

// -- Process directive
directives.forEach((directive) => {
    // -- Include
    if(directive.command == "include") {
        // -- Read replacement file
        const replacement = fs.readFileSync(directive.args[0], {encoding: "utf8"}).trim()
        // -- Replace contents
        contents = contents.replace(directive.text, replacement)
        // -- Debug
        console.log(chalk.cyan("\t\t" + "[INCLUDE] " + directive.args[0]))
    }
})

// -- Write output
fs.writeFileSync(options.outputFile, contents, {encoding: "utf8"})

// -- Closing debug
console.log()
