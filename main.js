const fs = require('fs');
const path = require("path");
const { exec } = require('child_process');
const glob = require("glob");

const appdata = process.env.LOCALAPPDATA == null ? `${(__dirname.split(":")[0])}:/Users/${(__dirname.split("\\")[2])}/AppData/Local` : process.env.LOCALAPPDATA;

let _ = fs.readdirSync(appdata, {
    withFileTypes: true
}).filter(r => r.isDirectory() && /(?:is)?cord/.test(r.name)).map(directory => directory.name);

_.forEach(a => {
    glob.sync(`${appdata}\\${a}\\app-*\\modules\\discord_desktop_core-*\\discord_desktop_core`).map(async a => {

        if (!fs.readdirSync(a).includes('index.js')) return

        let filename = path.join(a, "index.js");
        exec('tasklist', (_, t) => {

            if (t.includes(a.split('/')[5] + '.exe')) {
                exec(`taskkill /IM ${a.split('/')[5]}.exe /F`)
                setTimeout(() => {
                    if (fs.existsSync(appdata + `\\${a.split('/')[5]}\\Update.exe`)) exec(`${appdata + `\\${a.split('/')[5]}\\Update.exe`} --processStart ${a.split('/')[5]}.exe`)
                }, 2000)
            }
        })

        if (fs.readFileSync(filename, 'utf-8').toString() !== "module.exports = require('./core.asar');") {
            console.info(`\x1b[31mVous avez été token grabb dans ${a.split('/')[5]} !\x1b[0m`)
            fs.writeFile(filename, "module.exports = require('./core.asar');", e => {
                if (err) throw new Error(e)

                fs.readFile(filename, "utf8", (e, r) => {
                    if (e) throw new Error(e)
                    if (r.toString() !== "module.exports = require('./core.asar');") return console.error("\x1b[31mImpossible de retirer le grabber veuillez réinstaller discord pour le supprimer puis changer votre mot de passe!\x1b[0m")
                    console.info("\x1b[33m\nGrabber delete avec succès!\nVeuillez changer votre mot de passe.\x1b[0m")
                })

            })
        } else if (fs.existsSync(path.join(a, "package.json"))) {

            const file = require(path.join(a, "package.json"));

            if (file.main && file.main !== "index.js") {
                console.info(`\x1b[31mVous avez été token grabb dans ${file["main"]} !\x1b[0m`);
                
                try {
                    fs.unlinkSync(path.join(a, "package.json"))
                } catch (e) {
                    console.warn(e);
                }

                file.main = "index.js";
                fs.writeFile(path.join(a, "package.json"), JSON.stringify(file, null, 4), (err) => {
                    if (err) throw err
                })

            } else {
                console.log(`\x1b[32mL'instance ${a.split('/')[5]} est clean!\x1b[0m`)
            }
        } else {
            console.log(`\x1b[32mImpossible de verifier l'instance ${a.split('/')[5]} car le fichier package.json n'existe pas!\x1b[0m`)
        }
    })

})

setTimeout(() => process.exit(), 30000)