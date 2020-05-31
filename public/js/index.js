const users = {};
const socket = io();

  //- jquery
  $(document).ready(function(){

    socket.on('all logged in user', function(data) {
      Object.assign(users, data);
      //- add logged in user
      for(var u in users) {
        if(users[u].socketId == socket.id)
        {
          delete users[u]
        }else{
          $('.sideBar').append(sideBarBody(users[u].nickname, users[u].socketId));
        }
      }
    });

    socket.on('login user nickname', function (data) { 
      users[data.nickname] = data; 
      //- add current user
      $('.sideBar').append(sideBarBody(data.nickname, data.socketId));
    });

    socket.on('logged out user', function (nickname) {
      delete users[nickname];      
      $('.sideBar-body').each(function(index) {
        let sideBarBody = $(this);
        if(sideBarBody.find('.name-meta').text() == nickname)
        {
          sideBarBody.remove();
          $('.heading-name-meta').text('-');
          $('.heading-socket-id').text('-');
          $('.heading-user-icon').empty();
          $('.loggedInDateTime').text('');
          $('.sideBar').append(registerArea);
        }
      });
    });
    
    var sideBarBody = function (nickname, socketId) {
      return `<div class="row sideBar-body">
                <div class="col-sm-3 col-xs-3 sideBar-avatar">
                  <div class="avatar-icon">
                    <img src="https://bootdey.com/img/Content/avatar/avatar1.png">
                  </div>
                </div>
                <div class="col-sm-9 col-xs-9 sideBar-main">
                  <div class="row">
                    <div class="col-sm-8 col-xs-8 sideBar-name">
                      <span class="name-meta">${nickname}</span>
                      <p class="socketId">${socketId}</p>
                    </div>
                    <div class="col-sm-4 col-xs-4 pull-right sideBar-time">
                      <span class="time-meta pull-right">18:18
                    </span>
                    </div>
                  </div>
                </div>
              </div>`;
    };

    var registerArea = function() {
      return `<div class="row sideBar-body">
                <div class="col-sm-9 col-xs-9 sideBar-main">
                  <div class="row">
                    <div class="col-sm-6 col-xs-6 sideBar-name">
                        <input type="text" name="nickname" id="nickname" class="form-control" placeholder="First Name" tabindex="1">
                        
                    </div>
                    <div class="col-sm-6 col-xs-6 pull-right sideBar-time">
                        <button type="button" class="btn btn-success btn-register">Register</button> 
                    </span>
                    </div>
                  </div>
                </div>
              </div>`;
    }
    
    
    $('.sideBar').bind('DOMSubtreeModified', function() {

      //- remove duplicate
      $('.sideBar-body').each(function(index) {
        let sideBarBody = $(this);
        if(sideBarBody.find('.socketId').text()[index] == sideBarBody.find('.socketId').text()[index-1])
        {
          sideBarBody.remove();
        }
      });

      if($('.sideBar-body').length > 0)
      {
        $('.sideBar-body').click(function(e) {
          $('.heading-name-meta').text($(this).find('.name-meta').text());
          $('.heading-socket-id').text($(this).find('.socketId').text());
          $('.heading-avatar-icon').find('img').prop('src', $(this).find('.avatar-icon').find('img').prop('src'));
        });
      }
    });

    $('#comment').prop('disabled', true);
    $('.heading-socket-id').bind('DOMSubtreeModified', function() {
      if($('.heading-socket-id').text() != '-' || $('.heading-socket-id').text() != '' || $('.heading-socket-id').text().length > 0)
      {
        $('#comment').prop('disabled', false);
      }
    });

    
    //- register a name
    $('.btn-register').click(function() {
      var nickname = $('#nickname').val();
      var loggedInDate = new Date();
      socket.emit('login', {nickname, loggedInDate});
      $(this).remove();
      $('#nickname').remove();
      //- if it is the current user
      $('.sideBar-body:first-child').remove();
      
      $('.heading-user-icon').append(`<p>${nickname} (${socket.id})</p>`);
      $('.loggedInDateTime').text(loggedInDate);
    });

    
    var singleSendSide = function(message, dateTime) {
      return ` <div class="row message-body">
                <div class="col-sm-12 message-main-sender">
                  <div class="sender">
                    <div class="message-text">
                      ${message}
                    </div>
                    <span class="message-time pull-right">
                      ${dateTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>`;
    }

    var singleReceiveSide = function(message, dateTime) {
      return `<div class="row message-body">
                <div class="col-sm-12 message-main-receiver">
                  <div class="receiver">
                    <div class="message-text">
                      ${message}
                    </div>
                    <span class="message-time pull-right">
                      ${dateTime}
                    </span>
                  </div>
                </div>
              </div>`;
    }

    //- receive private chat
    socket.on('chat_message', function(data) {
      console.log('someone chat with you', data);
      $('#conversation').append(singleReceiveSide(data.message, data.dateTime));
    });

    //- when repley-send clicked
    $('.reply-send').click(function() {
      var message = $('#comment').val();
      var friendNickName = $('.heading-name-meta').text();
      if(message != '' && message){
        //- send private chat
        socket.emit('private chat', {message, friendNickName});
        $('#conversation').append(singleSendSide(message, new Date()));
        $('#comment').val('');
      }
      
    });

    //- when enter clicked
    $('#comment').keypress(function (e) {
      var keycode = (e.keyCode ? e.keyCode : e.which);
      if(keycode == '13'){
        e.preventDefault();
        var message = $('#comment').val();
        var friendNickName = $('.heading-name-meta').text();
        //- send private chat
        socket.emit('private chat', {message, friendNickName});
        $('#conversation').append(singleSendSide(message, new Date()));
        $('#comment').val('');
      }
      
    });

    $('#conversation').bind('DOMSubtreeModified', function() {
      $("#conversation").animate({
        scrollTop: $("#conversation").prop("scrollHeight")
       }, 2000);
    });
    
    
  });