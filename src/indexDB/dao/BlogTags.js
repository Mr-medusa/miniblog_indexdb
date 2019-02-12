import db from '../DataSource';

function BlogTags() {
    this.get = function (id) {
        return db.blogTags.get(id);
    };

    this.put = function(tags){
        return db.blogTags.put(tags);
    };

    this.delete = function(id){
        return db.blogTags.delete(id);
    };
}
export default BlogTags;