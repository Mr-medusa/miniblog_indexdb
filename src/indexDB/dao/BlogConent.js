import db from '../DataSource';

function BlogContent() {
    this.get = function (id) {
        return db.blogContent.get(id);
    };

    this.put = function(tags){
        return db.blogContent.put(tags);
    };

    this.delete = function(id){
        return db.blogContent.delete(id);
    };
}
export default BlogContent;