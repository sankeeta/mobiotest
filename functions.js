const fs = require("fs")
const libFunction = {}

libFunction.checkFileExist = async function(path){  
    try {
      console.log('checkFileExist ; ',path)
      await fs.access(path)
      return new Promise.resolve()
    } catch {
      return new Promise.reject()
    }
}

module.exports = {
  libFunction : libFunction
}