const fs = require('fs')
const process = require('process')
const crypto = require('crypto')
const { performance } = require('perf_hooks')

const readlineSync = require('readline-sync')

const hashAlgorithm = "sha512"
const iterations = 100_000

const args = require("args-parser")(process.argv)

// values for example default data: saltPostfix is "example" and the passwords are "test", "hello" and "world"
const data = JSON.parse(fs.readFileSync(args.datafile))

const salt = data.saltPrefix + readlineSync.question("Salt Postfix?\n", { hideEchoBack: true })
if (salt == "/exit") {
  process.exit(0)
}

let input
while (data.passwordShortHashes.length > 0) {
  input = readlineSync.question(`${data.passwordShortHashes.length} passwords left (type "/help" for help)\n`, { hideEchoBack: true })
  if (input == "/help") {
    console.log("/generate to generate new hash")
    console.log("/exit to exit")
  } else if (input == "/exit") {
    process.exit(0)
  } else if (input == "/generate") {
    const password = readlineSync.question(`password to generate hash for?\n`, { hideEchoBack: true })
    const smallHash = runAndMeasureTime(() => getSmallHash(password, salt))
    console.log(`smallHash: ${smallHash}`)
  } else {
    const smallHash = getSmallHash(input, salt)
    data.passwordShortHashes = data.passwordShortHashes.filter(x => x != smallHash)
  }
}

console.log("SUCCESS - you know all your passwords :)")

function getSmallHash(password, salt) {
  let result = `${salt}-${password}`
  for (let i = 0; i < iterations; i++) {
    result = crypto.createHash(hashAlgorithm).update(result).digest()
  }
  return result.toString('hex').substring(0, data.shortHashLength)
}

function runAndMeasureTime(callback) {
  var t0 = performance.now()
  const result = callback()
  var t1 = performance.now()
  console.log("call took " + Math.round(t1 - t0) + " milliseconds")
  return result
}
