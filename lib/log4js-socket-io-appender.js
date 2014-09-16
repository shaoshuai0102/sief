function socketIOAppender (io) {
  return function (loggingEvent) {
    io.emit('log', loggingEvent);
  };
}

function configure (config) {

}


exports.name      = 'socket.io';
exports.appender  = socketIOAppender;
exports.configure = configure;