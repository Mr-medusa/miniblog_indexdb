import db from '../DataSource';

function Blog() {

    this.get = function (id) {
        return db.blog.get(id);
    };
    this.getAll = function () {
        return db.blog.orderBy("updateTime").reverse().toArray();
    };

    this.put = function(pad){
        return db.blog.put(pad);
    };

    this.delete = function(id){
        return db.blog.delete(id);
    };
}

export default Blog;