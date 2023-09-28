
/*
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
 */

/*
 * Work started 09/26/2023
 * Some code instanced from CCSE, as required for dependancy purposes
 * CCSE Code from https://klattmose.github.io/CookieClicker/CCSE-POCs/
 * All credit for the CCSE implementation methods and code goes to Matt Klose
 *
 * https://steamcommunity.com/sharedfiles/filedetails/?id=2991686040
 */

if(shimmerPop === undefined) {
    var shimmerPop = {};
}

if(typeof CCSE == 'undefined') {
    Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE.js');
}

shimmerPop.name = 'Testing';
shimmerPop.version = '1.0.1';
shimmerPop.GameVersion = '2.052';

const menuHeader = '<div class="listing" style="margin:24px 0px 6px;"><label style="border:none;font-size:14px;font-weight:bold;">';

shimmerPop.launch = function() {

    shimmerPop.init = function() {
        Game.customOptionsMenu.push(function(){
			CCSE.AppendCollapsibleOptionsMenu(shimmerPop.name + ' (v' + shimmerPop.version + ')', shimmerPop.getMenuString());
        });
        CCSE.AddStyles(`
		.subOption {
			padding:3px 16px 0px 24px;
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
       var resetFeatures = shimmerPop.defaultFeatures();
        Object.keys(shimmerPop.features).forEach(function(e) {
            var f = shimmerPop.features[e];
            f.state = resetFeatures[e].state;
            f.delay = resetFeatures[e].delay;
            if(f.interval) {
                clearInterval(f.interval);
                f.interval = null;
            }
        });
        shimmerPop.save(shimmerPop.config);
        Game.UpdateMenu();
    }

    shimmerPop.save = function() {
        var saveData = {};
        Object.keys(shimmerPop.features).forEach(function(e) {
            var f = shimmerPop.features[e];
            saveData[e] = {
                state: f.state,
                delay: f.delay
            }
        });
        return JSON.stringify(saveData);
	}

	shimmerPop.load = function(str) {
		if(shimmerPop.isLoaded) return;
		var saveData = JSON.parse(str);
        Object.keys(shimmerPop.features).forEach(function(e) {
            if(saveData.hasOwnProperty(e)) {
                var f = shimmerPop.features[e];
                f.state = saveData[e].state;
                f.delay = saveData[e].delay;
                if(f.state != false) {
                    f.interval = setInterval(function(){f.loop();}, f.delay);
                }
            }
        });
		shimmerPop.isLoaded = 1;
	}

    shimmerPop.toggleFeature = function(key) {
        var f = shimmerPop.features[key];
        f.state = !f.state;
        if(!f.state) {
            if(f.hasOwnProperty('interval')) {
                clearInterval(f.interval);
                f.interval = null;
            }
        } else {
            if(f.hasOwnProperty('interval')) {
                f.interval = setInterval(function(){f.loop();}, f.delay);
            }
        }
		l(key).className = `smallFancyButton prefButton option${f.state ? '' : ' off'}`;
        l(key).innerHTML = `${f.state != false ? f.info.on : f.info.off}`;
    }

    shimmerPop.updateSlider = function(key) {
        var f = shimmerPop.features[key];
        f.delay = l(key+'_SLIDER').value;
        if(f.state != false) {
            clearInterval(f.interval);
            f.interval = setInterval(function(){f.loop();}, f.delay);
        }
        l(key+'_DESC_DELAY').innerHTML = f.delay + 'ms';
        l(key+'_SLIDER_RightText').innerHTML = f.delay + 'ms';
        l(key+'_SLIDER').value = f.delay;
    }

	shimmerPop.getMenuString = function() {
        var menuString = '';
        var menuHeaders = {};
        Object.keys(shimmerPop.features).forEach(function(e) {
            var f = shimmerPop.features[e];
            if(!menuHeaders.hasOwnProperty(f.info.menu)) {
                menuHeaders[f.info.menu] = [];
            }
            var description = f.info.desc;
            var feature = '';
            var slider = '';
            if(description.search('DELAY') > -1) {
                description = description.replace('DELAY', `<span id="${e}_DESC_DELAY">${f.delay}ms</span>`);
                slider = `<div class="listing subOption"><div class="sliderBox"><div style="float:left;" class="smallFancyButton">Delay</div>` +
                `<div style="float:right;" class="smallFancyButton" id="${e}_SLIDER_RightText">${f.delay}ms</div>` +
                `<input type="range" id="${e+'_SLIDER'}" class="slider" style="clear:both;" min="1" max="1000" step="1"` +
                ` value="${f.delay}" onchange="shimmerPop.updateSlider('${e}')" oninput="shimmerPop.updateSlider('${e}')" onmouseup="PlaySound('snd/tick.mp3');"></div></div>`;
            }
            feature = `<div class="listing"><a id="${e}" class="smallFancyButton option prefButton${f.state ? '' : ' off'}" ${ Game.clickStr }="shimmerPop.toggleFeature('${e}'); PlaySound('snd/tick.mp3');">${f.state != false ? f.info.on : f.info.off}</a><label>${description}</label></div>`;
            feature += slider;
            menuHeaders[f.info.menu] += feature;
        });
        Object.keys(menuHeaders).forEach(function(e) {
            menuString += menuHeader + e + '</div>';
            menuString += menuHeaders[e];
        });
        menuString += menuHeader + 'Mod Config</div>' + '<div class="listing">' + CCSE.MenuHelper.ActionButton("shimmerPop.resetConfigConfirmation();", "Reset Config") + '<label>Restore the default configuration to the config. Useful after a mod update.</label></div>';
        return menuString;
    }

    shimmerPop.features = {};
    shimmerPop.defaultFeatures = function() {
        return {
            shimmerBigCookie: { // calling it bigCookie led to conflicts!
                state: false,
                delay: 250,
                info: {
                    menu: "Autoclickers",
                    desc: "Clicks the big cookie every DELAY",
                    on: "Clicking the Big Cookie",
                    off: "Ignoring the Big Cookie"
                },
                interval: null,
                loop: function() {
                    Game.ClickCookie();
                    Game.autoclickerDetected = 0;
                }
            },
    
            goldCookies: {
                state: true,
                delay: 100,
                info: {
                    menu: "Autoclickers",
                    desc: "Clicks every gold cookie that appears",
                    on: "Clicking Gold Cookies",
                    off: "Ignoring Gold Cookies"
                },
                interval: null,
                loop: function() {
                    if(Game.shimmers.length >= 1) {
                        Game.shimmers.filter((s) => s.wrath == 0 && s.type != "reindeer").forEach(o => o.pop());
                    }
                }
            },
    
            wrathCookies: {
                state: false,
                delay: 100,
                info: {
                    menu: "Autoclickers",
                    desc: "Clicks every wrath cookie that appears",
                    on: "Clicking Wrath Cookies",
                    off: "Ignoring Wrath Cookies"
                },
                interval: null,
                loop: function() {
                    if(Game.shimmers.length >= 1) {
                        Game.shimmers.filter((s) => s.wrath != 0 && s.type != "reindeer").forEach(o => o.pop());
                    }
                }
            },
    
            reindeer: {
                state: true,
                delay: 100,
                info: {
                    menu: "Autoclickers",
                    desc: "Clicks every reindeer that appears",
                    on: "Clicking Reindeer",
                    off: "Ignoring Reindeer"
                },
                interval: null,
                loop: function() {
                    if(Game.shimmers.length >= 1) {
                        Game.shimmers.filter((s) => s.type == "reindeer").forEach(o => o.pop());
                    }
                }
            },
    
            wrinklers: {
                state: false,
                delay: 100,
                info: {
                    menu: "Autoclickers",
                    desc: "Pops wrinklers when they spawn around the big cookie",
                    on: "Popping Wrinklers",
                    off: "Ignoring Wrinklers"
                },
                interval: null,
                loop: function() {
                    Game.wrinklers.filter((w) => w.phase>0 && w.hp>0).forEach(o => o.hp = 0);
                }
            },
    
            fortunes: {
                state: true,
                delay: 500,
                info: {
                    menu: "Autoclickers",
                    desc: "Clicks each fortune which appears in the news feed",
                    on: "Clicking Fortunes",
                    off: "Ignoring Fortunes"
                },
                interval: null,
                loop: function() {
                    if (Game.TickerEffect && Game.TickerEffect.type == 'fortune') {
                        Game.tickerL.click();
                    }
                }
            },

            feedSanta: {
                state: true,
                delay: 500,
                info: {
                    menu: "Special",
                    desc: "Feeds Santa cookies until he's fully grown. Only works once Santa is unlocked (Christmas Season, \"A Festive Hat\" upgrade purchased).",
                    on: "Feeding Santa",
                    off: "Ignoring Santa"
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

            levelKrumblor: {
                state: false,
                delay: 500,
                info: {
                    menu: "Special",
                    desc: "Levels Krumblor automatically with available resources. Does not rebuy buildings. Only works once Krumblor is unlocked (Heavenly Chip upgrade \"How to bake your dragon\".) Automatically pets Krumblor once \"Pet the dragon\" is unlocked.",
                    on: "Leveling Krumblor",
                    off: "Ignoring Krumblor"
                },
                interval: null,
                loop: function() {
                    if (Game.dragonLevel<Game.dragonLevels.length-1 && Game.dragonLevels[Game.dragonLevel].cost()) {
                        Game.specialTab = "dragon";
                        Game.UpgradeDragon();
                        Game.ToggleSpecialMenu(0);
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
                }
            },

            buyAllUpgrades: {
                state: true,
                delay: 500,
                info: {
                    menu: "Autoclickers",
                    desc: "Automatically buys every available upgrade. Ignores Research.",
                    on: "Buying Upgrades",
                    off: "Saving Upgrades"
                },
                interval: null,
                loop: function() {
                    for(var i in Game.UpgradesInStore) {
                        var me = Game.UpgradesInStore[i];
                        if(!me.isVaulted() && me.pool!='toggle' && me.pool!='tech' && me.name != "Chocolate egg") {
                            me.buy(1);
                        }
                    }
                }
            },
    
            autoResearch: {
                state: false,
                delay: 500,
                info: {
                    menu: "Autoclickers",
                    desc: "Initiates all newly available research.",
                    on: "Researching",
                    off: "No Science Here"
                },
                interval: null,
                loop: function() {
                }
            },
    
            muteNonMinigames: {
                state: true,
                delay: 500,
                info: {
                    menu: "Autoclickers",
                    desc: "Automatically mutes buildings which don't have a minigame",
                    on: "Muting Buildings",
                    off: "Ignoring Buildings"
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
                state: true,
                delay: 500,
                info: {
                    menu: "Autoclickers",
                    desc: "Automatically expand all minigame buildings",
                    on: "Expanding Minigames",
                    off: "Ignoring Minigames"
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

        }
    }

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
