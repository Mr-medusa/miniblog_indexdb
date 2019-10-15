export default {
    /*******************静态*************************/
    folders: [
        {
            parentId: null,
            id: 999,
            name: "DEFAULT",
            isShow: false,
            isStretch: true,
            isChecked: false,
            children: [],
        }
    ],
    blogs: [],
    /****************IndexBD*******************/
    pads: [
        {
            parentId: null,
            id: "DUIS",
            name: "DEFAULT",
            isShow: false,
            isChecked: false,
            isStretch: true,
            children: [],
        }
    ],
    pad: [],

    blogs: [
        {id: "A", title: "A", tags: ["标签1"], updateTime: new Date()},
        {id: "B", title: "B", tags: ["标签2"], updateTime: new Date()},
        {id: "C", title: "C", tags: ["标签3"], updateTime: new Date()},
        {id: "D", title: "D", tags: ["标签4"], updateTime: new Date()},
        {id: "E", title: "E", tags: ["标签5"], updateTime: new Date()},
        {id: "F", title: "F", tags: ["标签5"], updateTime: new Date()},
        {id: "G", title: "G", tags: ["标签6"], updateTime: new Date()},
        {id: "H", title: "H", tags: ["标签7"], updateTime: new Date()},
        {id: "J", title: "J", tags: ["标签8"], updateTime: new Date()},
        {id: "L", title: "L", tags: ["标签9"], updateTime: new Date()},
    ],
    blogContent: [
        {id: "A", title: "A", tags: "标签1", updateTime: new Date(), previewContent: "A", htmlContent: "A"},
        {id: "B", title: "B", tags: "标签2", updateTime: new Date(), previewContent: "B", htmlContent: "B"},
        {id: "C", title: "C", tags: "标签3", updateTime: new Date(), previewContent: "C", htmlContent: "C"},
        {id: "D", title: "D", tags: "标签4", updateTime: new Date(), previewContent: "D", htmlContent: "D"},
        {id: "E", title: "E", tags: "标签5", updateTime: new Date(), previewContent: "E", htmlContent: "E"},
        {id: "F", title: "F", tags: "标签5", updateTime: new Date(), previewContent: "F", htmlContent: "F"},
        {id: "G", title: "G", tags: "标签6", updateTime: new Date(), previewContent: "G", htmlContent: "G"},
        {id: "H", title: "H", tags: "标签7", updateTime: new Date(), previewContent: "H", htmlContent: "H"},
        {id: "J", title: "J", tags: "标签8", updateTime: new Date(), previewContent: "J", htmlContent: "J"},
        {id: "L", title: "L", tags: "标签9", updateTime: new Date(), previewContent: "L", htmlContent: "L"},
    ],
    blogTags: {
        id: "blogTags",
        tags: [["标签1", 1], ["标签2", 1], ["标签3", 1], ["标签4", 1],["标签5", 2], ["标签6", 1], ["标签7", 1], ["标签8", 1],["标签9", 1]],
    },
    initBlogTestData: function () {
        for (let i = 0; i < 100; i++) {
            var updateTime = new Date(1995, 11, i)
            this.blogs.push({id: "M" + i, title: "M" + i, tags: ["标签10"], updateTime: updateTime});
            this.blogContent.push({
                id: "M" + i,
                title: "M" + i,
                tags: "标签10",
                updateTime: updateTime,
                previewContent: "M的测试数据"+i,
                htmlContent: "M的测试数据" + i
            });
        }
        this.blogTags.tags.push(["标签10",100]);
    }

}