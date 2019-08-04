// Keep in mind that
//  The Jest global does not go throught "babel"
// Therefore we need to use the legacy file concontrol

module.exports = async () => {
    await global.httpServer.close();
}