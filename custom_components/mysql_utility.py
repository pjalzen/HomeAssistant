import asyncio
from functools import partial
import logging

import voluptuous as vol
from homeassistant.const import CONF_HOST, CONF_USERNAME, CONF_PASSWORD
import homeassistant.helpers.config_validation as cv

REQUIREMENTS = ['mysql-connector==2.1.6']

DOMAIN = "mysql_utility"
CONF_DATABASE = 'database'
CONF_ACTION1 = 'action1'
CONF_ACTION2 = 'action2'
CONF_ACTION3 = 'action3'

import mysql.connector

_LOGGER = logging.getLogger(__name__)

""" key's expected from user configuration"""
SERVICE_RUN_COMMANDS = 'run_commands'

MYSQL_UTILITY_RUN_COMMAND = vol.Schema({
    vol.Required(CONF_HOST): cv.string,
    vol.Required(CONF_USERNAME): cv.string,
    vol.Required(CONF_PASSWORD): cv.string,
    vol.Required(CONF_DATABASE): cv.string,
    vol.Required(CONF_ACTION1): cv.string,
    vol.Optional(CONF_ACTION2): cv.string,
    vol.Optional(CONF_ACTION3): cv.string
})

@asyncio.coroutine
def async_setup(hass, config):

    @asyncio.coroutine
    def run_commands(call):
       _LOGGER.debug("fakeSQL: Before commands")

       host = call.data.get(CONF_HOST)
       username = call.data.get(CONF_USERNAME)
       password = call.data.get(CONF_PASSWORD)
       database = call.data.get(CONF_DATABASE)
       action1 = call.data.get(CONF_ACTION1)
       action2 = call.data.get(CONF_ACTION2)
       action3 = call.data.get(CONF_ACTION3)

       cnx = mysql.connector.connect(user=username, password=password, host=host, database=database)
       cursor = cnx.cursor()
   
       cursor.execute(action1)
       something = cursor.lastrowid
       _LOGGER.debug("fakeSQL: After Action 1, Somthing =%s", something)

       if action2 is not None:
         cursor.execute(action2)
         something = cursor.lastrowid
         _LOGGER.debug("fakeSQL: After Action 2, Somthing =%s", something)

       if action3 is not None:
         cursor.execute(action3)
         something = cursor.lastrowid
         _LOGGER.debug("fakeSQL: After Action 3, Somthing =%s", something)

       cnx.commit()
       cursor.close()
       cnx.close()
       _LOGGER.debug("fakeSQL: Done with commands")

    hass.services.async_register(
         DOMAIN, SERVICE_RUN_COMMANDS, run_commands,
         schema=MYSQL_UTILITY_RUN_COMMAND)

    return True