
/* -------------------------------------------------------------------------------
 *                                     LICENSE
 * -------------------------------------------------------------------------------
 * Copyright 2023 Best Dad (https://steamcommunity.com/id/trumplostlmfao/)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the “Software”), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * -------------------------------------------------------------------------------
 */


/*
 * Some code instanced from CCSE, as required for dependency purposes
 * CCSE Code from https://klattmose.github.io/CookieClicker/CCSE-POCs/
 * All credit for the CCSE implementation methods and code goes to Matt Klose
 *
 * Work started 09/26/2023 for v3 rewrite
 * Shimmer Pop Steam Workshop Link
 * https://steamcommunity.com/sharedfiles/filedetails/?id=2991686040
 * Best Dad's Steam Profile Link
 * https://steamcommunity.com/id/trumplostlmfao/
 * 
 * Hello to anyone reading. Programming Shimmer Pop was a pretty fun side project!
 * Gave me something to do while killing Kraken on Oldschool Runescape =P
 * The rewrite also allowed me to test a different approach to saving a 'config' and
 * setting up feature loops. I much prefer my new approach to v2.1's code.
 * Feel free to use the code as laid out in the MIT license. Attribution isn't needed,
 * just ensure you keep the MIT license and open source your project, but a shoutout
 * is always appreciated. I enjoy programming, and want to get better at it, and someone
 * using what I've done and improving on it would make me happy.
 */

if(shimmerPop === undefined) {
    var shimmerPop = {};
}

if(typeof CCSE == 'undefined') {
    Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE.js');
}

shimmerPop.name = 'Shimmer Pop';
shimmerPop.version = '3.0';
shimmerPop.GameVersion = '2.052';

const menuHeader = '<div class="listing" style="margin:24px 0px 6px;"><label style="border:none;font-size:14px;font-weight:bold;">';

shimmerPop.launch = function() {

    var unlockedCheats = false; // could probably put this in 'features' but nahhh

    shimmerPop.init = function() {
        Game.customOptionsMenu.push(function(){
			CCSE.AppendCollapsibleOptionsMenu(shimmerPop.name + ' (v' + shimmerPop.version + ')', shimmerPop.getMenuString());
        });
        CCSE.SpliceCodeIntoFunction("Game.ClickCookie", 21, "var clickX=Game.cookieOriginX;var clickY=Game.cookieOriginY;");
        CCSE.ReplaceCodeIntoFunction("Game.ClickCookie", `Game.mouseX+Math.random()*8-4,Game.mouseY-8+Math.random()*8-4`,
            `clickX+Math.random()*8-4,clickY-8+Math.random()*8-4`, 0);
        CCSE.ReplaceCodeIntoFunction("Game.UpgradeDragon", `Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2)`,
            `(shimmerPop && shimmerPop.features.manageKrumblor.saveData.state == false ? Game.SparkleAt((rect.left+rect.right)/2,(rect.top+rect.bottom)/2) : 0)`, 0);
        CCSE.ReplaceCodeIntoFunction("Game.getNewTicker", `var list=[];`,
            `var list=["News : Shimmer Pop version 3 has been released! Cookies everywhere shiver in anticipation of being clicked automatically!", "News : Best Dad sends his regards. Thank you for using Shimmer Pop!"];`, 0);
        Game.customInfoMenu.push(function(){
            CCSE.PrependCollapsibleInfoMenu(`${shimmerPop.name} (v${shimmerPop.version})`, shimmerPop.updateNotes);
        });
        CCSE.AddStyles(`
        .padLeft {
            margin-left: 24px;
        }
        .sliderPadding {
            margin-left: 38px;
        }
		.fancySelectBox {
			color: #ccc;
			font-family:'Merriweather', Georgia,serif;
			font-variant: small-caps;
			font-weight: bold;
			font-size: 12px;
			text-decoration: none;
			display: inline-block;
			background: #000 url(img/darkNoise.jpg);
			background-image: url(img/shadedBordersSoft.png), url(img/darkNoise.jpg);
			background-size: 100% 100%, auto;
			background-color: #000;
			margin: 2px 4px 2px 24px;
			line-height: 100%;
			border: 1px solid #e2dd48;
			border-color: #ece2b6 #875526 #733726 #dfbc9a;
			border-radius: 2px;
			text-align-last: right;
			width: 200px;
			vertical-align: middle;
		}
		.fancySelectBox > option {
			direction: rtl; 
		}`);
        shimmerPop.features = shimmerPop.defaultFeatures();
        if(Game.prefs.popups) {
            Game.Popup(shimmerPop.name + ' loaded!');
        } else {
            Game.Notify(shimmerPop.name + ' loaded!', '', '', 1, 1);
        }
    }

    shimmerPop.resetConfigConfirmation = function() {
        Game.Prompt(`Reset ${shimmerPop.name}'s config to the default settings?`,[[loc("Yes"),'shimmerPop.resetConfig();Game.ClosePrompt();','float:left'],[loc("No"),0,'float:right']]);
    }

    shimmerPop.resetConfig = function() {
        shimmerPop.unlockedCheats = false;
        // Have to terminate the loops first
        Object.keys(shimmerPop.features).forEach(function(e) {
            var feature = shimmerPop.features[e];
            if(feature.saveData && feature.saveData.state == true && feature.interval != null) {
                clearInterval(feature.interval);
            }
        });
        shimmerPop.features = shimmerPop.defaultFeatures();
        // Then reinitiate the loops, but none of them are active by default
        /*Object.keys(shimmerPop.features).forEach(function(e) {
            var feature = shimmerPop.features[e];
            if(feature.saveData && feature.saveData.state == true) {
                feature.interval = setInterval(function() {
                    feature.loop();
                }, feature.saveData.delay);
            }
        });*/
        shimmerPop.save();
        Game.UpdateMenu();
    }

    shimmerPop.save = function() {
        var saveData = {cheats: shimmerPop.unlockedCheats};
        Object.keys(shimmerPop.features).forEach(function(e) {
            var feature = shimmerPop.features[e];
            if(feature.saveData != undefined) {
                saveData[e] = feature.saveData;
            }
        });
        return JSON.stringify(saveData);
	}

	shimmerPop.load = function(str) {
		if(shimmerPop.isLoaded) {
            return;
        }
		var saveData = JSON.parse(str);
        if(saveData['cheats']) {
            shimmerPop.unlockCheats();
        }
        Object.keys(shimmerPop.features).forEach(function(e) {
            if(saveData.hasOwnProperty(e)) {
                var feature = shimmerPop.features[e];
                Object.keys(saveData[e]).forEach(function(f) {
                    feature.saveData[f] = saveData[e][f];
                });
                // Initiating the loops has repeated a couple times in nested circumstances, but I don't think plopping the functionality into a separate function is worthwhile
                if(feature.saveData.state == true) {
                    feature.interval = setInterval(function() {
                        feature.loop();
                    }, feature.saveData.delay);
                }
            }
        });
        shimmerPop.features.pantheon.init();
		shimmerPop.isLoaded = 1;
	}

    shimmerPop.unlockCheatsConfirmation = function() {
        Game.Prompt(`Unlock the Cheat menu? It can only be relocked by resetting the entire config. Unlocking cheats doesn't disable achievements. If you wish to only get achievements fairly, think twice.`,[[loc("Yes"),'shimmerPop.unlockCheats();Game.ClosePrompt();','float:left'],[loc("No"),0,'float:right']]);
    }

    shimmerPop.unlockCheats = function() {
        shimmerPop.unlockedCheats = true;
        Game.UpdateMenu();
    }

    shimmerPop.runFeature = function(key) {
        var feature = shimmerPop.features[key];
        feature.init();
    }

    shimmerPop.toggleFeature = function(key, toggle='state') {
        var feature = shimmerPop.features[key];
        feature.saveData[toggle] = !feature.saveData[toggle];
        if(feature.saveData.state != undefined && feature.saveData.state) {
            feature.interval = setInterval(function() {
                feature.loop();
            }, feature.saveData.delay);
        } else {
            if(feature.interval != undefined) {
                clearInterval(feature.interval);
                feature.interval = null;
            }
        }
        if(toggle != 'state' && feature.hasOwnProperty('init')) {
            feature.init();
        }
        Game.UpdateMenu();
    }

    shimmerPop.updateSlider = function(key) {
        var feature = shimmerPop.features[key];
        feature.saveData.delay = Math.min(Math.max(l(key+'_SLIDER').value, feature.slider.min), feature.slider.max);
        if(feature.saveData.delay % feature.slider.step != 0) {
            feature.saveData.delay = feature.slider.min;
        }
        if(feature.saveData.state != false) {
            clearInterval(feature.interval);
            feature.interval = setInterval(function() {
                feature.loop();
            }, feature.saveData.delay);
        }
        l(key+'_DESC_DELAY').innerHTML = (feature.saveData.delay / feature.slider.step) + feature.slider.suffix;
        l(key+'_SLIDER_RightText').innerHTML = (feature.saveData.delay / feature.slider.step) + feature.slider.suffix;
        l(key+'_SLIDER').value = feature.saveData.delay;
    }

    shimmerPop.togglePantheon = function(event, slot) {
		let god = event.target.value;
		shimmerPop.features.pantheon.saveData[slot] = god;
        shimmerPop.features.pantheon.init();
		Game.UpdateMenu();
	}

    shimmerPop.toggleKrumblorAura = function(event, auraSlot) {
		let aura = event.target.value;
		shimmerPop.features.manageKrumblor.saveData[auraSlot] = aura;
        shimmerPop.features.manageKrumblor.slotAuras();
		Game.UpdateMenu();
	}

    shimmerPop.joinDiscord = function() {
        window.open('https://discord.gg/XUP9n5zD37', '_blank', 'show=false');
    }
    shimmerPop.openGitHub = function() {
        window.open('https://github.com/Kuiper-Belt-Object-Pluto/shimmer-pop', '_blank', 'center=true,skipTaskbar=false');
    }

    shimmerPop.clamp = function(value, min, max) {
        return Math.min(Math.max(Math.trunc(value), min), max);
    }

    shimmerPop.getMenuString = function() {
        var menuString = '';
        var menuHeaders = {};
        Object.keys(shimmerPop.features).forEach(function(key) {
            var feature = shimmerPop.features[key];
            var featureMenu = feature.menu;
            if(!menuHeaders.hasOwnProperty(featureMenu)) {
                menuHeaders[featureMenu] = [];
            }
            switch(featureMenu) {
                case "Pantheon":
                    if(Game.Objects['Temple'].amount<=0) {
                        menuHeaders["Pantheon"] += '<div class="listing padLeft"><label>Pantheon settings will be available once the Temple is at least level 1.</label></div>';
                        break;
                    }
                    var temple = Game.Objects['Temple'].minigame;
                    if(temple != undefined && Game.Objects['Temple'].minigameLoaded) {
                        for(var i=0; i<=2; i++) {
                            var str = `<div class="listing"><select id="shimmerPopPantheonSlot${i}" class="fancySelectBox" onchange="shimmerPop.togglePantheon(event, 'slot${i}')"><option value="null"${feature.saveData['slot' + i] == null ? " selected" : "" }>Unslotted</option>`;
                            for(var g = 0; g<temple.godsById.length; g++) {
                                var god = temple.godsById[g];
                                var disabled = '';
                                if(feature.saveData.slot0 == god.id || feature.saveData.slot1 == god.id || feature.saveData.slot2 == god.id) {
                                    disabled = " disabled";
                                }
                                str += `<option value="${god.id}"${disabled}${god.id == feature.saveData['slot' + i] ? " selected" : ""}>${god.name}</option>`;
                            }
                            str += `</select><label>${i == 0 ? "Diamond Slot" : i == 1 ? "Ruby Slot" : "Jade Slot"}</label></div>`;
                            menuHeaders["Pantheon"] += str;
                        }
                    }
                    break;

                case "Krumblor":
                    if(!Game.Has('How to bake your dragon')) {
                        menuHeaders["Krumblor"] += `<div class="listing padLeft"><label>Krumblor settings will be available once you unlock 'How to bake your dragon' through Heavenly Chips.</label></div>`;
                        break;
                    }
                    menuHeaders["Krumblor"] += `<div class="listing padLeft"><a id="${key}_state" class="smallFancyButton option prefButton${feature.saveData['state'] ? '' : ' off'}" ${Game.clickStr}="shimmerPop.toggleFeature('${key}'); PlaySound('snd/tick.mp3');">${feature.saveData['state'] != false ? feature.on : feature.off}</a><label>${feature.desc}</label></div>`;
                    menuHeaders["Krumblor"] += `<div class="listing padLeft"><a id="${key}_rebuyBuildings" class="smallFancyButton option prefButton${feature.saveData['rebuyBuildings'] ? '' : ' off'}" ${Game.clickStr}="shimmerPop.toggleFeature('${key}', 'rebuyBuildings'); PlaySound('snd/tick.mp3');">${feature.saveData['rebuyBuildings'] != false ? 'Rebuying Buildings' : 'Ignoring Rebuys'}</a><label>Rebuy buildings Krumblor absorbs during leveling. Only works when auto leveling with the above feature. Will buy back buildings absorbed from swapping auras.</label></div>`;
                    for(var i=0; i<=1; i++) {
                        var str = `<div class="listing"><select id="shimmerPopKrumblorAura${i}" class="fancySelectBox" onchange="shimmerPop.toggleKrumblorAura(event, 'aura${i}')">`;
                        Object.keys(Game.dragonAuras).forEach(function(key) {
                            var aura = Game.dragonAuras[key];
                            var disabled = '';
                            if(key>0 && (feature.saveData.aura0 == key || feature.saveData.aura1 == key)) {
                                disabled = " disabled";
                            }
                            str += `<option value="${key}"${disabled}${key == feature.saveData['aura' + i] ? " selected" : ""}>${aura.name}</option>`;
                        });
                        str += `</select><label>${i == 0 ? "Aura #1 (on the right)" : "Aura #2 (on the left)"}</label></div>`;
                        menuHeaders["Krumblor"] += str;
                    }
                    break;
                    
                default:
                    if(feature.saveData) {
                        var description = feature.desc;
                        var slider = '';
                        if(description.search('DELAY') > -1) {
                            description = description.replace('DELAY', `<span id="${key}_DESC_DELAY">${feature.saveData.delay/feature.slider.step}${feature.slider.suffix}</span>`);
                            slider = `<div class="listing sliderPadding"><div class="sliderBox"><div style="float:left;" class="smallFancyButton">Delay</div>` +
                            `<div style="float:right;" class="smallFancyButton" id="${key}_SLIDER_RightText">${feature.saveData.delay/feature.slider.step}${feature.slider.suffix}</div>` +
                            `<input type="range" id="${key+'_SLIDER'}" class="slider" style="clear:both;" min="${feature.slider.min}" max="${feature.slider.max}" step="${feature.slider.step}"` +
                            ` value="${feature.saveData['delay']}" onchange="shimmerPop.updateSlider('${key}')" oninput="shimmerPop.updateSlider('${key}')" onmouseup="PlaySound('snd/tick.mp3');"></div></div>`;
                        }
                        if(feature.append) {
                            var t = feature.append.text;
                            description += ` ${t.replace('[X]', feature.saveData[`${feature.append.variable}`])}`;
                        }
                        menuHeaders[featureMenu] += `<div class="listing padLeft"><a id="${key}_state" class="smallFancyButton option prefButton${feature.saveData['state'] ? '' : ' off'}" ${Game.clickStr}="shimmerPop.toggleFeature('${key}'); PlaySound('snd/tick.mp3');">${feature.saveData['state'] != false ? feature.on : feature.off}</a><label>${description}</label></div>` + slider;
                    } else {
                        menuHeaders[featureMenu] += `<div class="listing padLeft"><a id="${key}_state" class="smallFancyButton option" ${Game.clickStr}="shimmerPop.runFeature('${key}'); PlaySound('snd/tick.mp3');">${feature.text}</a><label>${feature.desc}</label></div>`;
                    }
                    break;
            }
        });

        Object.keys(menuHeaders).forEach(function(key) {
            menuString += `${menuHeader}${key}</div>`;
            if(key != "Cheats" || (key=="Cheats" && shimmerPop.unlockedCheats)) {
                menuString += menuHeaders[key];
            } else {
                menuString += `<div class="listing padLeft"><a id="${key}" class="smallFancyButton option" ${Game.clickStr}="shimmerPop.unlockCheatsConfirmation(); PlaySound('snd/tick.mp3');">Unlock Cheat Features</a><label>You haven\'t unlocked cheats. Would you like to?</label></div>`;
            }
        });

        menuString += menuHeader + 'Mod Config</div>';
        menuString += '<div class="listing padLeft">' + CCSE.MenuHelper.ActionButton("shimmerPop.joinDiscord();", "Discord") + '<label>Join the Shimmer Pop Discord - Discuss Cookie Clicker, and the mod. Opens silently, invite will pop up directly on Discord.</label></div>';
        menuString += '<div class="listing padLeft">' + CCSE.MenuHelper.ActionButton("shimmerPop.openGitHub();", "GitHub") + '<label>Check out the source code directly on GitHub!</label></div>';
        menuString += '<div class="listing padLeft">' + CCSE.MenuHelper.ActionButton("shimmerPop.resetConfigConfirmation();", "Reset Config") + '<label>Restore the default configuration to the config.</label></div>';

        return menuString;
    }

    shimmerPop.features = {};
    shimmerPop.defaultFeatures = function() {
        return {
            shimmerBigCookie: { // calling it bigCookie led to conflicts!
                menu: "Autoclickers",
                desc: "Clicks the big cookie every DELAY. I recommend disabling Numbers in the options above. May interfere with clicking objects in the left box.",
                on: "Clicking the Big Cookie",
                off: "Ignoring the Big Cookie",
                saveData: {
                    state: false,
                    delay: 250,
                    beep: false,
                },
                slider: {
                    min: 1,
                    max: 1000,
                    step: 1,
                    suffix: "ms"
                },
                interval: null,
                loop: function() {
                    Game.ClickCookie();
                    Game.autoclickerDetected = 0;
                }
            },

            goldCookies: {
                menu: "Autoclickers",
                desc: "Clicks every gold cookie that appears",
                on: "Clicking Gold Cookies",
                off: "Ignoring Gold Cookies",
                saveData: {
                    state: false,
                    delay: 100,
                },
                interval: null,
                loop: function() {
                    if(Game.shimmers.length >= 1) {
                        Game.shimmers.filter((s) => s.wrath == 0 && s.type != "reindeer").forEach(o => o.pop());
                    }
                }
            },
    
            wrathCookies: {
                menu: "Autoclickers",
                desc: "Clicks every wrath cookie that appears",
                on: "Clicking Wrath Cookies",
                off: "Ignoring Wrath Cookies",
                saveData: {
                    state: false,
                    delay: 100,
                },
                interval: null,
                loop: function() {
                    if(Game.shimmers.length >= 1) {
                        Game.shimmers.filter((s) => s.wrath != 0 && s.type != "reindeer").forEach(o => o.pop());
                    }
                }
            },
    
            reindeer: {
                menu: "Autoclickers",
                desc: "Clicks every reindeer that appears",
                on: "Clicking Reindeer",
                off: "Ignoring Reindeer",
                saveData: {
                    state: false,
                    delay: 100,
                },
                interval: null,
                loop: function() {
                    if(Game.shimmers.length >= 1) {
                        Game.shimmers.filter((s) => s.type == "reindeer").forEach(o => o.pop());
                    }
                }
            },
    
            wrinklers: {
                menu: "Autoclickers",
                desc: "Pops wrinklers every DELAY",
                on: "Popping Wrinklers",
                off: "Ignoring Wrinklers",
                saveData: {
                    state: false,
                    delay: 3600000,
                },
                slider: {
                    min: 60000,
                    max: 14400000,
                    step: 60000,
                    suffix: " min"
                },
                interval: null,
                loop: function() {
                    Game.wrinklers.filter((w) => w.phase>0 && w.hp>0).forEach(o => o.hp = 0);
                }
            },
    
            fortunes: {
                menu: "Autoclickers",
                desc: "Clicks each fortune which appears in the news feed",
                on: "Clicking Fortunes",
                off: "Ignoring Fortunes",
                saveData: {
                    state: false,
                    delay: 500,
                },
                interval: null,
                loop: function() {
                    if (Game.TickerEffect && Game.TickerEffect.type == 'fortune') {
                        Game.tickerL.click();
                    }
                }
            },

            /*
             * STORE
             */
            buyAllUpgrades: {
                menu: "Store",
                desc: "Automatically buys every available upgrade. Ignores Research.",
                on: "Buying Upgrades",
                off: "Saving Upgrades",
                saveData: {
                    state: false,
                    delay: 250,
                },
                interval: null,
                loop: function() {
                    for(var i in Game.UpgradesInStore) {
                        var upgrade = Game.UpgradesInStore[i];
                        if(!upgrade.isVaulted() && upgrade.pool!='toggle' && upgrade.pool!='tech' && upgrade.name != "Chocolate egg") {
                            upgrade.buy(1);
                        }
                    }
                }
            },
    
            autoResearch: {
                menu: "Store",
                desc: "Initiates all newly available research",
                on: "Researching",
                off: "No Science Here",
                saveData: {
                    state: false,
                    delay: 100,
                },
                interval: null,
                loop: function() {
                    for(var i in Game.UpgradesInStore) {
                        var upgrade = Game.UpgradesInStore[i];
                        if(!upgrade.isVaulted() && upgrade.pool=='tech' && upgrade.name != "Chocolate egg") {
                            upgrade.buy(1);
                        }
                    }
                }
            },
            evenBuildings: {
                menu: "Store",
                desc: "Sells buildings to keep them at even increments of 50. Probably only useful with Rigidel in your Pantheon.",
                on: "Even Buildings",
                off: "Uneven Buildings",
                saveData: {
                    state: false,
                    delay: 500,
                },
                interval: null,
                loop: function() {
                    for(var i in Game.Objects) {
                        var building = Game.Objects[i];
                        var i = building.amount % 50;
                        if(i != 0) {
                           building.sell(i);
                        }
                    }
                }
            },



            /*
             * ET CETERA
             */
            harvestSugarLumps: {
                menu: "Et Cetera",
                desc: "Automatically harvests sugar lumps at their ripe stage to ensure you always receive 1 lump.",
                on: "Harvesting Lumps",
                off: "Ignoring Lumps",
                append: {
                    text: "Shimmer Pop has harvested [X] lumps for you!",
                    variable: "harvested"
                },
                saveData: {
                    state: false,
                    delay: 5000,
                    harvested: 0
                },
                interval: null,
                loop: function() {
                    if(!Game.canLumps()) {
                        clearInterval(this.interval);
                        this.interval = null;
                        this.saveData.state = false;
                        return;
                    }
                    var age = Date.now()-Game.lumpT;
                    if(age>=Game.lumpRipeAge && age<Game.lumpOverripeAge) {
                        Game.clickLump();
                        this.saveData.harvested++;
                    }
                }
            },
    
            muteNonMinigames: {
                menu: "Et Cetera",
                desc: "Automatically mutes buildings which don't have a minigame",
                on: "Muting Buildings",
                off: "Ignoring Buildings",
                saveData: {
                    state: false,
                    delay: 500,
                },
                interval: null,
                loop: function() {
                    var muted = ["Grandma","Mine","Factory","Shipment","Alchemy lab","Portal","Time machine","Antimatter condenser","Prism","Chancemaker","Fractal engine","Javascript console","Idleverse","Cortex baker","You"];
                    for(var i in Game.Objects) {
                        var building = Game.Objects[i];
                        if(muted.includes(building.name) && building.amount>0) {
                            building.mute(1);
                        }
                    }
                }
            },

            expandMinigames: {
                menu: "Et Cetera",
                desc: "Automatically expand all minigame buildings",
                on: "Expanding Minigames",
                off: "Ignoring Minigames",
                saveData: {
                    state: false,
                    delay: 500,
                },
                interval: null,
                loop: function() {
                    for(var i in Game.Objects) {
                        var building = Game.Objects[i];
                        if(building.amount>0 && building.level >= 1 && !building.onMinigame) {
                           building.switchMinigame(1);
                        }
                    }
                }
            },

            /*
             * SPECIAL
             */
            feedSanta: {
                menu: "Christmas",
                desc: "Feeds Santa cookies until he's fully grown. Only works once Santa is unlocked (Christmas Season, \"A Festive Hat\" upgrade purchased).",
                on: "Feeding Santa",
                off: "Ignoring Santa",
                saveData: {
                    state: false,
                    delay: 500,
                },
                interval: null,
                loop: function() {
                    if(Game.Has('A festive hat') && Game.santaLevel < 14) {
                        Game.specialTab = "santa";
                        Game.UpgradeSanta();
                        Game.ToggleSpecialMenu(0);
                    }
                }
            },

            manageKrumblor: {
                menu: "Krumblor",
                desc: "Levels Krumblor automatically with available resources. Does not rebuy buildings. Automatically pets Krumblor once \"Pet the dragon\" is unlocked.",
                on: "Leveling Krumblor",
                off: "Ignoring Krumblor",
                saveData: {
                    state: false,
                    delay: 500,
                    aura0: null,
                    aura1: null,
                    rebuyBuildings: false
                },
                interval: null,
                loop: function() {
                    if(Game.dragonLevel<Game.dragonLevels.length-1 && Game.dragonLevels[Game.dragonLevel].cost()) {
                        var preDragonLevel = Game.dragonLevel;
                        var preSpecialTab = Game.specialTab;
                        if(preSpecialTab == '') {
                            Game.specialTab = 'dragon';
                        }
                        Game.UpgradeDragon();
                        if(preSpecialTab == '') {
                            Game.ToggleSpecialMenu(0);
                        }
                        if(this.saveData.rebuyBuildings && Game.dragonLevel>=5) {
                            var buyList = [null,null,null,null,null, 'Cursor', 'Grandma', 'Farm', 'Mine', 'Factory', 'Bank', 'Temple', 'Wizard tower', 'Shipment', 'Alchemy lab', 'Portal', 'Time machine', 'Antimatter condenser', 'Prism', 'Chancemaker', 'Fractal engine', 'Javascript console', 'Idleverse', 'Cortex baker', 'You'];
                            switch(Game.dragonLevel) {
                                case Game.dragonLevels.length-2:
                                    for(var i = 5; i<buyList.length; i++) {
                                        Game.Objects[buyList[i]].buy(50);
                                    }
                                    break;
                                case Game.dragonLevels.length-1:
                                    for(var i = 5; i<buyList.length; i++) {
                                        Game.Objects[buyList[i]].buy(200);
                                    }
                                    break;
                                default:
                                    var building = Game.Objects[buyList[preDragonLevel]];
                                    building.buy(100);
                                    break;
                            }
                        }
                        this.slotAuras();
                    }
                    if(Game.dragonLevel>=4 && Game.Has('Pet the dragon')) {
                        Game.lastClickedSpecialPic = Date.now();
                        if(Game.dragonLevel>=8 && Math.random()<1/20) {
                            Math.seedrandom(Game.seed+'/dragonTime');
                            var drops = ['Dragon scale','Dragon claw','Dragon fang','Dragon teddy bear'];
                            drops = shuffle(drops);
                            var drop = drops[Math.floor((new Date().getMinutes()/60)*drops.length)];
                            if(!Game.Has(drop) && !Game.HasUnlocked(drop)) {
                                Game.Unlock(drop);
                                Game.Notify(drop,'<b>'+loc("Your dragon dropped something!")+'</b>',Game.Upgrades[drop].icon);
                            }
                            Math.seedrandom();
                        }
                    }
                },
                slotAuras: function() {
                    var preSpecialTab = Game.specialTab;
                    if(preSpecialTab == '') {
                        Game.specialTab = 'dragon';
                    }
                    var highestBuilding = 0;
                    for(var i in Game.Objects) {
                        if (Game.Objects[i].amount>0) {
                            highestBuilding = Game.Objects[i];
                        }
                    }
                    for(var i=0; i<=1; i++) {
                        var amt = highestBuilding.amount;
                        Game.SetDragonAura(this.saveData['aura' + i], i);
                        Game.ConfirmPrompt();
                        if(amt > highestBuilding.amount && this.saveData.rebuyBuildings) {
                            highestBuilding.buy(1);
                        }
                    }
                    if(preSpecialTab == '') {
                        Game.ToggleSpecialMenu(0);
                    }
                }
            },

            /*
             * Pantheon
             */
            pantheon: {
                menu: "Pantheon",
                desc: "Auto slot your preffered Gods. Will not unslot any God. Forces slotting, meaning it bypasses the swap limit.",
                saveData: {
                    slot0: null, // diamond
                    slot1: null, // ruby
                    slot2: null, // jade
                },
                init: function() {
                    var templeMinigame = Game.Objects['Temple'].minigame;
                    if(templeMinigame != undefined && Game.Objects['Temple'].minigameLoaded) {
                        templeMinigame.swaps = 3;
                        templeMinigame.swapT = Date.now();
                        for(var i=0; i<=2; i++) {
                            if(templeMinigame.slot[i] == -1) {
                                templeMinigame.dragGod(templeMinigame.godsById[this.saveData["slot" + i]]);
                                templeMinigame.hoverSlot(i);
                                templeMinigame.dropGod();
                                templeMinigame.hoverSlot(-1);
                            }
                        }
                    }
                }
            },

            /*
             * CHEATS
             */
            spawnGoldCookie: {
                menu: "Cheats",
                desc: "Spawn a Single Gold Cookie",
                text: "Spawn a Gold Cookie",
                init: function() {
                    new Game.shimmer('golden',{noWrath:true});
                }
            },

            spawnGoldCookieLoop: {
                menu: "Cheats",
                desc: "Continually spawn gold cookies every DELAY",
                on: "Spawning Gold Cookies",
                off: "Idle...",
                saveData: {
                    state: false,
                    delay: 1000,
                },
                slider: {
                    min: 1000,
                    max: 600000,
                    step: 1000,
                    suffix: "s"

                },
                interval: null,
                loop: function() {
                    new Game.shimmer('golden',{noWrath:true});
                }
            },

            spawnWrathCookieLoop: {
                menu: "Cheats",
                desc: "Continually spawn wrath cookies every DELAY",
                on: "Spawning Wrath Cookies",
                off: "Idle...",
                saveData: {
                    state: false,
                    delay: 1000,
                },
                slider: {
                    min: 1000,
                    max: 600000,
                    step: 1000,
                    suffix: "s"

                },
                interval: null,
                loop: function() {
                    new Game.shimmer('golden',{noWrath:false});
                }
            },

            infiniteMagic: {
                menu: "Cheats",
                desc: "Grants infinite magic. Use the grimoire to your desire.",
                on: "Infinite Magic",
                off: "Finite Magic",
                saveData: {
                    state: false,
                    delay: 100,
                },
                interval: null,
                loop: function() {
                    var g = Game.ObjectsById[7].minigame;
                    if(g) {
                        g.magic = g.magicM;
                    }
                }
            },

            infiniteBuffs: {
                menu: "Cheats",
                desc: "Buffs are permanent",
                on: "Infinite Buffs",
                off: "Ignoring Buffs",
                saveData: {
                    state: false,
                    delay: 100,
                },
                interval: null,
                loop: function() {
                    var debuffs = ['Clot', 'Cursed finger', 'Haggler misery', 'Nasty goblins', 'Magic inept'];
                    for(var i in Game.buffs) {
                        var buff = Game.buffs[i];
                        if(debuffs.includes(buff.name) == false) {
                            buff.time = buff.maxTime;
                        }
                    }
                    Game.updateBuffs();
                }
            },

            removeDebuffs: {
                menu: "Cheats",
                desc: "Removes debuffs",
                on: "Removing Debuffs",
                off: "Ignoring Debuffs",
                saveData: {
                    state: false,
                    delay: 100,
                },
                interval: null,
                loop: function() {
                    var debuffs = ['Clot', 'Cursed finger', 'Haggler misery', 'Nasty goblins', 'Magic inept'];
                    for(var i in Game.buffs) {
                        var buff = Game.buffs[i];
                        if(debuffs.includes(buff.name) == true) {
                            buff.time = 0;
                        }
                    }
                    Game.updateBuffs();
                }
            },

        }
    }

    shimmerPop.updateNotes = '' +
        '<div class="subsection">' +
            '<div class="listing">Mod created by <a href="https://steamcommunity.com/id/trumplostlmfao/" target="_blank" class="highlightHover smallBlackButton">Best Dad</a></div>' +
            '<div class="listing">Mod found at <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=2991686040" target="_blank" class="highlightHover smallBlackButton">Shimmer Pop\'s Steam Workshop page</a></div>' +
            '<div class="listing">Join the <a href="https://discord.gg/XUP9n5zD37" target="_blank" class="highlightHover smallBlackButton">Discord</a></div>' +
            '<div class="listing">Find Shimmer Pop on <a href="https://github.com/Kuiper-Belt-Object-Pluto/shimmer-pop" target="_blank" class="highlightHover smallBlackButton">GitHub</a></div>' +
        '</div>' +
        '<div class="subsection update">' +
            '<div class="title">v3 Major Update (10/06/2023)</div>' +
            '<div class="listing">&bull; Rewrote entire codebase, now under the MIT license, and is on GitHub!</div>' +
            '<div class="listing">&bull; Added features:</div>' +
            '<div class="listing">&nbsp;&nbsp; &bull; Wrinkler popping delay, in minutes</div>' +
            '<div class="listing">&nbsp;&nbsp; &bull; Auto buying research</div>' +
            '<div class="listing">&nbsp;&nbsp; &bull; Auto expanding minigames</div>' +
            '<div class="listing">&nbsp;&nbsp; &bull; Auto rebuying buildings used to level krumblor</div>' +
            '<div class="listing">&nbsp;&nbsp; &bull; Auto aura slotting for krumblor</div>' +
            '<div class="listing">&nbsp;&nbsp; &bull; Auto slotting for the pantheon</div>' +
            '<div class="listing">&nbsp;&nbsp; &bull; Building evening, keeps buildings at increments of 50</div>' +
            '<div class="listing">&nbsp;&nbsp; &bull; Cheat menu, with toggle to enable them</div>' +
            '<div class="listing">&nbsp;&nbsp; &bull; Config reset</div>' +
            '<div class="listing">&bull; Added change log to the Info panel</div>' +
            '<div class="listing">&bull; Fixed previous issue of auto muting buildings muting unowned buildings (affected nothing, but shouldn\'t have happened regardless)</div>' +
            '<div class="listing">&bull; Changed the big cookie click delay to a pretty slider</div>' +
            '<div class="listing">&bull; Injected code into Game.ClickCookie() so numbers appear near the center of the cookie instead of at the mouse position</div>' +
            '<div class="listing">&bull; Injected code to disable the sparkle effect when krumblor levels from the auto feature</div>' +
            '<div class="listing">&bull; Feature toggles are now buttons instead of checkboxes, to better fit the game\'s aesthetics</div>' +
            '<div class="listing">&bull; Shimmer Pop options menu section now displays the mod\'s version number</div>' +
        '</div>' +
        '<div class="subsection update small">' +
            '<div class="title">v2.1 Minor Update (Sep 17 2023 08:13)</div>' +
            '<div class="listing">&bull; Rewrote the script start/termination functions to ensure no same script can run twice and prevent you from turning them off</div>' +
            '<div class="listing">&bull; Added Big Cookie autoclicking</div>' +
            '<div class="listing">&bull; Added a delay input box for how often the big cookie should be clicked</div>' +
        '</div>' +
        '<div class="subsection update">' +
            '<div class="title">v2 Major Update (Sep 11 2023 11:46)</div>' +
            '<div class="listing">&bull; Added options for each functionality to be toggled</div>' +
            '<div class="listing">&bull; Separated functionality of auto popping to distinct object types</div>' +
            '<div class="listing">&bull; Added fortune cookie popping</div>' +
            '<div class="listing">&bull; Added auto buying all available upgrades</div>' +
            '<div class="listing">&bull; Added auto leveling Santa</div>' +
            '<div class="listing">&bull; Added auto feeding Krumblor</div>' +
            '<div class="listing">&bull; Added auto building muting for non-minigame buildings (all except Farm, Bank, Temple, Wizard tower)</div>' +
            '<div class="listing">&bull; Added sugar lump harvesting</div>' +
            '<div class="listing">&bull; Added sugar lump override to only harvest ripe lumps instead of at maturity</div>' +
        '</div>' +
        '<div class="subsection update small">' +
            '<div class="title">v1.1 Minor Update (Jun 19 2023 16:46)</div>' +
            '<div class="listing">&bull; Added loop to pop wrinklers</div>' +
        '</div>' +
        '<div class="subsection update small">' +
            '<div class="title">v1 Initial Release (Jun 19 2023 10:52)</div>' +
            '<div class="listing">&bull; Added loop to pop gold cookies, wrath cookies, and reindeer (shimmer objects, the source of the name for the mod)</div>' +
        '</div>';

    if(CCSE.ConfirmGameVersion(shimmerPop.name, shimmerPop.version, shimmerPop.GameVersion)) {
		Game.registerMod(shimmerPop.name, shimmerPop);
    }
}

if(!shimmerPop.isLoaded){
	if(CCSE && CCSE.isLoaded){
		shimmerPop.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(shimmerPop.launch);
	}
}
