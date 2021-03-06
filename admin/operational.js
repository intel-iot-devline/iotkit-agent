/*
Copyright (c) 2014, Intel Corporation

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.
    * Neither the name of Intel Corporation nor the names of its contributors
      may be used to endorse or promote products derived from this software
      without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var logger = require("../lib/logger").init(),
    Cloud = require("../api/cloud.proxy"),
    Message = require('../lib/agent-message'),
    utils = require("../lib/utils").init(),
    config = require('../config');

var activate = function (code) {
    logger.debug("Activation started ...");
    utils.getDeviceId(function (id) {
        var cloud = Cloud.init(config, logger, id);
        cloud.activate(code, function (err) {
            var r = 0;
            cloud.disconnect();
            if (err) {
                logger.error("Error in the activation process ...", err);
                r = 1;
            }
            process.exit(r);
        });
    });
};

var isActivated = function (code) {
    utils.getDeviceId(function (id) {
        var cloud = Cloud.init(config, logger, id);
        if(!cloud.isActivated()) {
            logger.info("NO !! Device has not been activated");
            process.exit(1);
        } else {
            logger.info("YES !! Device is already active");
            process.exit(0);
        }
    });
};

var listAllDevices = function () {
    logger.debug("Activation started ...");
    utils.getDeviceId(function (id) {
        var cloud = Cloud.init(config, logger, id);
        cloud.activate(function (status) {
            var r = 0;
            if (status === 0) {
                cloud.listdevices(function (devices) {
                    if (devices) {
                        console.log("Response %j", devices);
                    }
                    process.exit(0);
                });
            } else {
                logger.error("Error in the registration process ...", status);
                process.exit(1);
            }
        });
    });
};

function testConnection () {
    var host = config.connector[config.default_connector].host;
    utils.getDeviceId(function (id) {
        var cloud = Cloud.init(config, logger, id);
        cloud.test(function (res) {
            var r = 0;
            if (res) {
                logger.info("Connected to %s", host);
                logger.info("Environment: %s", res.currentSetting);
                logger.info("Build: %s", res.build);
                logger.debug("Full response %j", res );
            } else {
                logger.error("Connection failed to %s", host);
                r = 1;
            }
            process.exit(r);
        });
    });
}

module.exports = {
    addCommand : function (program) {
        program
            .command('test')
            .description('Tries to reach the server (using the current protocol).')
            .action(function() {
                testConnection();
            });

        program
            .command('activate <activation_code>')
            .description('Activates the device.')
            .action(activate);

        program
            .command('isactivated')
            .description('Confirms whether the device is activated or not.')
            .action(isActivated);

        program
            .command('list-all-devices')
            .description('Lists all the devices under the current account.')
            .action(listAllDevices);
    }
};
