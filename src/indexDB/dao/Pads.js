import db from '../DataSource';

function Pads() {
    this.get = function (id) {
        return db.pads.get(id);
    };

    this.put = function (pads) {
        return db.pads.put(pads);
    };

    this.bulkPut = function (pads) {
        return db.pads.bulkPut(pads);
    };
}

export default Pads;