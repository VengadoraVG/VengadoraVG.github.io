var flow = (() => {
  var initializeDuration = 1000;
  var warningDuration = 5000;
  var respawnWait = 8000;
  var touchButtons = [
    'touch r 0', 'touch r 1', 'touch r 2', 'touch r 3',
    'touch l 0', 'touch l 1', 'touch l 2', 'touch l 3',
  ];

  var unstickTheCard = function () {
    if (!game.isCardInside) return;
    game.isCardInside = false;
    goToScreen("0");
    game.card.setEnabled(true);
    game.skeleton.beginAnimation("UnstickTheCard", false, 1, function () {
      game.card.actionManager.registerAction(game.card.stickInAction);
    });
  };

  var babylonAction = function (f) {
    return new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, f );
  };

  var selectCurrency = ((currency) => {
    return babylonAction(function () {
      game.currency = currency;
      goToScreen("22");
    });
  });

  var quickWhithdrawOption = babylonAction(function () {
    goToScreen("12");
  });

  var handlePinInput = function () {
    if (game.numbersPanel.isEnabled() && game.numbersPanel.button.input.length >= 4) {
      if (game.numbersPanel.button.input === '0000') {
        goToScreen("7"); // code accepted, do your stuff
      } else { // wrong code!
        goToScreen("5");

        if (++game.wrongCode >= 3) {
          game.capturedCard = true;
          retainCard();
        }
      }
    }
  };

  var retrieve = function () {
    var receipt = flow.scene.getMeshByName("receipt hitbox");
    var money = flow.scene.getMeshByName("money out hitbox");

    receipt.actionManager.actions = [];
    money.actionManager.actions = [];

    game.skeleton.beginAnimation("retrieve receipt and money", false);
    setTimeout(() => {
      goToScreen("16");
    }, 1000);
  }

  var spit = function (requestReceipt) {
    if (!requestReceipt && !game.spitsMoney) {
      game.spitsMoney = true;
      confirm();
      return;
    }
    goToScreen("14");
    flow.scene.getMeshByName("receipt").setEnabled(requestReceipt);
    var receipt = flow.scene.getMeshByName("receipt hitbox");
    receipt.setEnabled(requestReceipt);
    var money = flow.scene.getMeshByName("money out hitbox");
    flow.scene.getMeshByName("money out").setEnabled(game.spitsMoney);
    game.spitsMoney = true;

    game.skeleton.beginAnimation("SpitMoneyAndReceipt", false, 1, function () {
      receipt.actionManager = new BABYLON.ActionManager(flow.scene);
      receipt.actionManager.registerAction(babylonAction(function () {
        retrieve();
      }));
      money.actionManager = new BABYLON.ActionManager(flow.scene);
      money.actionManager.registerAction(babylonAction(function () {
        retrieve();
      }));
    });
  }

  var f = () => {
    if (game.isDeposit) {
      game.isDeposit = false;
      if (game.thirdPartyRequired) {
        goToScreen("33");
      } else {
        goToScreen("30");
      }
    } else {
      goToScreen("10");
    }
  }

  var whithdrawScreen = {
    buttons: ['touch r 0', 'touch r 1', 'touch r 2', 'touch r 3'],
    actions: [
      babylonAction(f),
      babylonAction(f),
      babylonAction(f),
      babylonAction(f)
    ]
  };

  var screens = {
    "3": { // language
      buttons: ['touch r 1',  'touch r 2'],
      actions: [
        babylonAction(function () { goToScreen("4"); }),
        babylonAction(function () { goToScreen("4"); })
      ]
    },
    "4": { // pin
      requirePin: true,
      hidePin: true,
      onInput: handlePinInput
    },
    "5": { // wrong pin, try again
      requirePin: true,
      hidePin: true,
      onInput: handlePinInput
    },
    "23": { // canceled transaction
      buttons: ['touch r 1', 'touch r 2'],
      actions: [
        babylonAction(unstickTheCard),
        babylonAction(function () { goToScreen("4"); })
      ]
    },
    "7": { // whatcha gonna do?
      buttons: ['touch l 3', 'touch l 2', 'touch l 1',
                'touch r 3'],
      actions: [
        babylonAction(function () { goToScreen("8"); }),
        babylonAction(function () {
          game.quickWhithdraw = true;
          goToScreen("8");
        }),
        babylonAction(function () {
          goToScreen("28");
        }),
        babylonAction(function () {
          goToScreen("20");
        })
      ]
    },
    "8": { // retiro
      buttons: ['touch r 0', 'touch r 1', 'touch r 2'],
      actions: [
        babylonAction(function () {
          goToScreen("46");
        }),
        babylonAction(function () {
          if (game.quickWhithdraw) {
            goToScreen("19");
          } else {
            goToScreen("45");
          }
        }),
        babylonAction(function () {
          if (game.quickWhithdraw) {
            goToScreen("19");
          } else {
            goToScreen("45");
          }
        })
      ]
    },
    "11": { // ingrese el monto
      buttons: ['touch r 1', 'touch r 2'],
      actions: [
        babylonAction(function () { game.erasePanels(); }),
        babylonAction(function () {
          if (game.amountPanel.value == 0 || (game.amountPanel.value / 100) % 10 != 0 ||
              (game.amountPanel.value/100) > 3000) {
            goToScreen("57");
          } else {
            goToScreen("12");
          }
        }),
      ],
      requireAmount: true
    },
    "10": { // whithdraw amount
      buttons: ['touch r 1'],
      actions: [
        babylonAction(function () { goToScreen("11"); })
      ]
    },
    "12": { // receipt?
      buttons: ['touch r 1', 'touch r 2'],
      actions: [
        babylonAction(function () { spit(false); }),
        babylonAction(function () { spit(true); })
      ],
      onCall: function () {
        game.quickWhithdraw = false;
      }
    },
    "45": whithdrawScreen, // TODO: este es depósito también
    "47": whithdrawScreen, // TODO: este es depósito también
    "16": { // something else?
      buttons: ['touch r 1', 'touch r 2'],
      actions: [
        babylonAction(unstickTheCard),
        babylonAction(() => goToScreen("4"))
      ]
    },
    "19": { // quick whithdraw amount
      buttons: [ 'touch r 0', 'touch r 1', 'touch r 2', 'touch r 3',
                 'touch l 0', 'touch l 1', 'touch l 2', 'touch l 3'],
      actions: [quickWhithdrawOption, quickWhithdrawOption, quickWhithdrawOption, quickWhithdrawOption,
                quickWhithdrawOption, quickWhithdrawOption, quickWhithdrawOption, quickWhithdrawOption]
    },
    "28": { // a dónde quieres transferir?
      buttons: ['touch r 1', 'touch r 2'],
      actions: [
        babylonAction(() => {
          game.thirdPartyRequired = true;
          goToScreen("29");
        }),
        babylonAction(() => {
          game.thirdPartyRequired = false;
          goToScreen("29");
        })
      ],
      onCall: function () {
        game.isDeposit = true;
        game.numberOfBills = 0;
      }
    },
    "29": { // type of currency
      buttons: ['touch r 2', 'touch r 1'],
      actions: [
        selectCurrency("bs"), selectCurrency("$")
      ]
    },
    "33": { // third party account
      buttons: ['touch r 0', 'touch r 1'],
      actions: [
        babylonAction(() => cancel()),
        babylonAction(() => goToScreen("30"))
      ],
      requireAccount: true
    },
    "22": { // tipo de cuenta
      buttons: ['touch r 1', 'touch r 2'],
      actions: [
        babylonAction(() => goToScreen("45")), // caja de ahorro
        babylonAction(() => goToScreen("47")), // cuenta corriente
      ]
    },
    "30": { // insert money
      onCall: function () {
        game.scene.getMeshByName("paper money in dollars").setEnabled(game.currency == "$");
        game.scene.getMeshByName("paper money in bs").setEnabled(game.currency == "bs");
        game.skeleton.beginAnimation("SpawnMoneyUp", false, 1, () => {
          game.scene.getMeshByName("money in hitbox").setEnabled(true);
          var hitbox = game.scene.getMeshByName("money in hitbox");
          hitbox.actionManager = new BABYLON.ActionManager(game.scene);

          hitbox.actionManager.registerAction(babylonAction(() => {
            game.numberOfBills++;
            game.scene.getMeshByName("money in hitbox").setEnabled(false);
            hitbox.actionManager.actions = [];
            game.skeleton.beginAnimation("StickTheMoney", false, 1, () => {
              game.quantityPanel.button.textBlock.text = game.numberOfBills + "";
              game.totalPanel.button.textBlock.text = game.multipliedPanel.button.textBlock.text =
                (game.numberOfBills * 100) + "";
              goToScreen("32"); // detalle del depósito
            });
          }));

        });
      }
    },
    "32": {
      buttons: [ 'touch l 0', 'touch r 1', 'touch r 0' ],
      actions: [
        babylonAction(() => {
          goToScreen("14"); // por favor, retire su efectivo
          game.skeleton.beginAnimation("SpitTheDepositedMoney", false, 1, () => {
            var hitbox = game.scene.getMeshByName("spitted money");
            hitbox.setEnabled(true);
            hitbox.actionManager = new BABYLON.ActionManager(game.scene);
            hitbox.actionManager.registerAction(babylonAction(() => {
              hitbox.actionManager.actions = [];
              hitbox.setEnabled(false);
              game.skeleton.beginAnimation("TakeTheDepositedMoney", false, 1, () => {
                cancel();
              });
            }));
          });
        }),
        babylonAction(() => {
          goToScreen("30");
        }),
        babylonAction(() => {
          game.spitsMoney = false;
          goToScreen("12");
        })
      ],
      onCall: function () {
        game.quantityPanel.setEnabled(true);
        game.totalPanel.setEnabled(true);
        game.multipliedPanel.setEnabled(true);
      },
      onQuit: function () {
        game.quantityPanel.setEnabled(false);
        game.totalPanel.setEnabled(false);
        game.multipliedPanel.setEnabled(false);
      }
    },
    "46": { // no can do (tarjeta de crédito)
      onCall: function () {
        game.blocked = true;
        setTimeout(() => {
          game.blocked = false;
          game.cancelFunction();
        }, warningDuration);
      }
    },
    "20": {
      buttons: [ 'touch r 0' ],
      actions: [
        babylonAction(() => {
          goToScreen("46");
        })
      ]
    }
  };

  var disableAllButtons = function () {
    for (var i=0; i<4; i++) {
      var mesh = flow.scene.getMeshByName("touch r " + i);
      if (mesh.actionManager) {
        mesh.actionManager.actions = [];
      }
      var mesh = flow.scene.getMeshByName("touch l " + i);
      if (mesh.actionManager) {
        mesh.actionManager.actions = [];
      }
    }
  }

  var goToScreen = function (screenName) {
    if (flow.currentScreen && flow.currentScreen.onQuit) {
      flow.currentScreen.onQuit();
    }

    game.goToScreen(screenName);
    console.log(screenName, screens[screenName]);
    flow.currentScreen = screens[screenName];
    disableAllButtons(flow.scene);
    if (screens[screenName]) {
      if (screens[screenName].buttons) {
        for (var i=0; i<screens[screenName].buttons.length; i++) {
          var button = flow.scene.getMeshByName(screens[screenName].buttons[i]);
          button.actionManager = new BABYLON.ActionManager(flow.scene);
          button.actionManager.registerAction(screens[screenName].actions[i]);
        }
      }
      if (screens[screenName].requirePin) {
        game.numbersPanel.setEnabled(true);
        game.hidePin = screens[screenName].hidePin;
        game.numbersPanel.button.textBlock.text = "";
        game.numbersPanel.button.input = "";
      } else {
        game.numbersPanel.setEnabled(false);
      }
      if (screens[screenName].requireAmount) {
        game.amountPanel.setEnabled(true);
        game.amountPanel.value = 0;
        game.amountPanel.button.textBlock.text = "0.00";
      } else {
        game.amountPanel.setEnabled(false);
      }
      if (screens[screenName].requireAccount) {
        game.accountPanel.setEnabled(true);
        game.accountPanel.button.textBlock.text = "";
      } else {
        game.accountPanel.setEnabled(false);
      }
      if (flow.toRemove) {
        document.removeEventListener('onNumpadInput', flow.toRemove);
      }
      if (screens[screenName].onInput) {
        flow.toRemove = screens[screenName].onInput;
        document.addEventListener('onNumpadInput', flow.toRemove);
      }
      if (screens[screenName].onCall) {
        console.log("call");
        screens[screenName].onCall();
      }
    } else {
      game.numbersPanel.setEnabled(false);
      game.amountPanel.setEnabled(false);
      game.accountPanel.setEnabled(false);
    }
  };

  var confirm = function () {
    game.quickWhithdraw = false;
    goToScreen("16");
  }

  var cancel = function () {
    game.quickWhithdraw = false;
    goToScreen("23");
  }

  var initializeChip = function () {
    // goToScreen("10");
    // game.isCardInAnimationOver = true;

    game.card.setEnabled(false);
    game.isCardInAnimationOver = false;
    goToScreen("1");
    setTimeout(() => {
      goToScreen("2");
      setTimeout(() => {
        goToScreen("3");
        game.isCardInAnimationOver = true;
      }, initializeDuration/2);
    }, initializeDuration/2);
  };

  var retainCard = function () {
    goToScreen("6");
    setTimeout(() => {
      goToScreen("0");
    }, warningDuration);

    setTimeout(() => {
      game.skeleton.beginAnimation("RespawnCard", false, 1, function () {
        game.wrongCode = 0;
        game.capturedCard = game.isCardInAnimationOver = game.isCardInside = false;
      });
    }, respawnWait);
  }

  return {
    initializeChip: initializeChip,
    cancel: cancel,
    goToScreen: goToScreen
  };
})();
