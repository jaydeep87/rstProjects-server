//global.logger = require('./api/utils/logger')('cmtapi_' + new Date().getDate() + '_' + (new Date().getMonth() + 1) + '.log');
//usage example :
//doConnection(process.env.DB_CON, function (status) {
//  logger.info(status);
//});

const winston = require('winston');

const tsFormat = () => ( new Date() ).toLocaleDateString() + ' - ' + ( new Date() ).toLocaleTimeString();
const level = process.env.LOG_LEVEL || 'debug';

    /**
     *
     *  { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
     */
    var spogLogger = new (winston.Logger)({
        transports: [
            new (winston.transports.File) ({
                level: level,
                handleExceptions: true,
                timestamp: tsFormat,
                filename:"logs/logs_"+new Date().getDate()+"_"+(new Date().getMonth()+1)+".log",
                json: true,
                colorize: true
            })
        ]
    });

    var convertToString = function(val) {
        var r = '';
        try{ r = JSON.stringify(val); }
        catch (err) { return r; }
        return r;
     }


   var checkJSON = function (m) {
        if (typeof m == 'object') {
            try{ m = JSON.stringify(m); }
            catch(err) { return false; } }

        if (typeof m == 'string') {
            try{ m = JSON.parse(m); }
            catch (err) { return false; } }

        if (typeof m != 'object') { return false; }
        return true;
    };

    var constructMessage = function(info, message) {
        var text;
        if (message != null && message != undefined) {
            text =  info + ' : ' + (checkJSON(message) ? convertToString(message) : message);
        } else {
            text = info;
        }
        return text;
    };

module.exports = function(fileName) {
    var logger = {
        error: function(error, message) {
            spogLogger.error(constructMessage(error, message));
        },
        info: function(info, message) {
            spogLogger.info(constructMessage(info, message));
        },
        warn: function(warn, message) {
            spogLogger.warn(constructMessage(warn, message));
        },
        debug: function(debug, message) {
            spogLogger.debug(constructMessage(debug, message));
        },
        verbose: function(verbose, message) {
            spogLogger.verbose(constructMessage(verbose, message));
        },
        silly: function(silly, message) {
            spogLogger.silly(constructMessage(silly, message));
        }
    }
    return logger
}
