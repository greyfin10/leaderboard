PlayersList = new Mongo.Collection('players');

if (Meteor.isClient) {

  Meteor.subscribe('thePlayers');

  Template.leaderboard.helpers({
    'player': function() {
      return PlayersList.find({},{sort: {score: -1, name: 1}});
    },
    'playerCount': function() {
      return PlayersList.find({}).count();
    },
    'selectedClass': function() {
      if (Session.get('selectedPlayer') == this._id) {
        return "selected";
      }
    },
    'showSelectedPlayer': function() {
      return PlayersList.findOne(Session.get('selectedPlayer'));
    }
  });
  
  Template.leaderboard.events({
    'click .player': function() {
      Session.set('selectedPlayer',this._id);
    },
    'click .increment': function() {
      Meteor.call('modifyPlayerScore',Session.get('selectedPlayer'), 5);
    },
    'click .decrement': function() {
      Meteor.call('modifyPlayerScore',Session.get('selectedPlayer'), -5);
    },
    'click .remove': function() {
      Meteor.call('removePlayerData',Session.get('selectedPlayer'));
    }
  });

  Template.addPlayerForm.events({
    'submit form': function(event){ 
       event.preventDefault();
       Meteor.call('insertPlayerData',event.target.playerName.value); 
     }
  });

}
if (Meteor.isServer) {
  Meteor.publish('thePlayers', function() {
    return PlayersList.find({createdBy: this.userId});
  });
  Meteor.methods({
    'insertPlayerData': function(playerNameVar){
       PlayersList.insert({
         name: playerNameVar,
         score: 0,
         createdBy: Meteor.userId()
       });
    },
    'removePlayerData': function(selectedPlayer) {
      PlayersList.remove(selectedPlayer);
    },
    'modifyPlayerScore': function(selectedPlayer, scoreValue) {
      PlayersList.update({_id: selectedPlayer, createdBy: Meteor.userId()}, {$inc: {score: scoreValue}});
    }
  });
}

