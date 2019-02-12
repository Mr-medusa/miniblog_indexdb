import db from '../DataSource';

function Pad() {
    this.get = function (id) {
        return db.pad.get(id);
    };

    this.delete = function(id){
        return db.pad.delete(id);
    };

    this.put = function(pad){
        return db.pad.put(pad);
    };
}

export default Pad;