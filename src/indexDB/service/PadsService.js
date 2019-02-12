import Pads from "../dao/Pads"
import Pad from "../dao/Pad"

var padsDao = new Pads();
var padDao = new Pad();

export default {
    /****************** folders start *********************/
    put: function (EventHub, res) {
        padsDao.put(EventHub.folderRoot).then(function () {
            EventHub.$emit("goTip", [res.successful, true])
        }).catch(function callback() {
            EventHub.$emit("goTip", [res.unsuccessful, false])
        });
    },

    get: function (id) {
        return padsDao.get(id);
    },
    /****************** folders end *********************/

    /****************** card start *********************/
    deleteCard(id){
        return padDao.delete(id);
    },
    getCard(id) {
        return padDao.get(id);
    },
    putCard(card) {
        return padDao.put(card);
    },
    /****************** card end *********************/

}

