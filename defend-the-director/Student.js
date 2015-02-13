var Student = function (level) {
    var i,
    max,
    FEMALE = 1,
    MALE = 0,
    quantityBodyParts;

    this.level = level;

    this.bodyPart = [];
    // 1: female, 0: male
    this.gender = Math.round(Math.random());
    quantityBodyParts = 4 + this.gender;

    for (i=0; i<quantityBodyParts; i++) {
        this.bodyPart[i] = game.add.sprite(0,0, 'student');
    }

    // setting up animations for each bodyPart
    this.setHead();
    this.setHair();
    this.setBody();

    if (this.gender == FEMALE) {
        this.setBoobs();
    }

    this.setLegs();
    this.sprite = this.legs;
    this.sprite.kill();
};

Student.prototype.setHead = function () {
    this.head = this.bodyPart[0];
    this.head.animations.add('stand', [0]);
};

Student.prototype.setHair = function () {
    this.hair = this.bodyPart[1];
    this.hair.animations.add('stand', [1+this.gender]);
}

Student.prototype.setLegs = function () {
    var i;

    this.legs = this.bodyPart[2];
    this.legs.animations.add('stand', [3]);
    this.legs.animations.add('walk', [3,4], 3, true);
    game.physics.arcade.enable(this.legs);

    for (i=0, max=this.bodyPart.length; i<max; i++) {
        this.bodyPart[i].animations.play('stand');

        if (this.bodyPart[i] != this.legs) {
            this.legs.addChild(this.bodyPart[i]);
        }

        this.bodyPart[i].bringToTop();
    }

}

Student.prototype.setBody = function () {
    this.body = this.bodyPart[3];
    this.body.animations.add('stand', [6]);
    this.body.animations.add('walk', [5,6,7,6], 3, true);
};

Student.prototype.setBoobs = function () {
    this.boobs = this.bodyPart[4];
    this.boobs.animations.add('stand', [8]);
};




Student.prototype.spawn = function (posX, posY) {
    this.sprite.reset(posX, posY);
    this.sprite.body.acceleration.y = 481;
    this.sprite.body.velocity.x = 50;
};

Student.prototype.walk = function () {

    if (this.legs.animations.currentAnim.name != 'walk') {
        this.legs.animations.play('walk');
        this.body.animations.play('walk');
    }

    if (this.legs.animations.currentAnim.frame == 3) {
        this.moveHeadTo(0,1);
    } else {
        this.moveHeadTo(0,0);
    }

};

Student.prototype.moveHeadTo = function (posX, posY) {
    this.hair.x = this.head.x = posX;
    this.hair.y = this.head.y = posY;
};

Student.prototype.stand = function () {
    var i;

    for (i=this.bodyPart.length-1; i>=0; i--) {
        this.bodyPart[i].animations.play('stand');
    }
};



Student.prototype.update = function () {
    this.sprite.scale.set(this.level.globalScale, this.level.globalScale);
    if (this.sprite.body.velocity.x === 0) {
        this.stand();
    } else {
        this.walk();
    }
};
