<template>
        <div id="pads" class="pads">
            <!--文件夹弹出框-->
            <transition name="alert-fade">
                <operator-modal v-if="folderAlert"
                                v-on:createFolderAlertOK="createFolderAlertOK"
                                v-on:createFolderAlertCancel="createFolderAlertCancel"
                                v-on:deleteFolderAlertOK="deleteFolderAlertOK"
                                v-on:deleteFolderAlertCancel="deleteFolderAlertCancel"
                                v-on:editFolderAlertOK="editFolderAlertOK"
                                v-on:editFolderAlertCancel="editFolderAlertCancel"
                                v-on:addPadAlertOK="addPadAlertOK"
                                v-on:addPadAlertCancel="addPadAlertCancel"
                                :width="alertWidth"
                                :alertTitle="alertTitle"
                                :alertCallBackName="alertCallBackName"
                >
                    <template slot="content">
                        <component v-bind:is="alertComponent"
                                   v-model="newFolderOrPad"
                                   :alertMsg="alertMsg"
                                   :newFileName="newFileName"
                                   :classify="classify"
                                   :orders="orders"
                        >
                        </component>
                    </template>
                </operator-modal>
            </transition>
            <!--侧边栏-->
            <div class="pads-sidebar">
                <div class="pads-operator">
                    <div class="folder-operator-btn-group">
                        <div class="icon-group">
                            <span class="fa folder-operator hvr-wobble-top" :class="{'fa-expand':!collapseAll,'fa-compress ':collapseAll}" title="switch to" @click="collapseAll = !collapseAll"></span>
                        </div>
                        <div class="icon-group">
                            <span class="fa fa-trash-o folder-operator hvr-wobble-top" title="delete folder" @click="delFolder"></span>
                            <span class="fa fa-pencil-square-o folder-operator hvr-wobble-top" title="edit folder" @click="updateFolder"></span>
                            <span class="fa fa-plus-square-o folder-operator hvr-wobble-top" title="new folder" @click="newFolder"></span>
                        </div>
                    </div>
                </div>
                <!--侧边栏-->
                <div id="scroll-box">
                    <div class="protector">
                        <div v-for="folder in folders">
                            <folder-tree :folder="folder"
                                         :colors="colors"
                                         :selectedState="selectedState"
                                         :parent="null"
                                         :collapseAll="collapseAll"></folder-tree>
                        </div>
                    </div>
                </div>
            </div>
            <!--内容区-->
            <div class="pads-content">
                <pad-operator-button  v-on:addPad="addPad" :folders="folders"></pad-operator-button>
                <div class="pad-grid-pen">
                    <pad-card></pad-card>
                </div>
            </div>
         </div>
</template>

<script>
    import '../assets/css/pads.css'
    import '../assets/css/cus-codemirror.css'

    import EventHub from "../utils/EventHub"
    import Utils from "../utils/Utils"
    import FrontConfig from "../config/FrontConfig"

    import folderTree from '../components/folder/FolderTree'
    import UpdatePadModal from '../components/modal/UpdatePadModal.vue'
    import deleteFolderOrPad from '../components/modal/DeleteFolderOrPad'
    import operatorModal from '../components/modal/OperatorModal.vue'
    import padCard from '../components/pads/PadCard'
    import padOperatorButton from '../components/pads/PadOperatorButton'

    import PadsService from "../indexDB/service/PadsService";

    export default {
        name: 'Pads',
        components: {
            folderTree,
            operatorModal,
            UpdatePadModal,
            deleteFolderOrPad,
            padCard,
            padOperatorButton
        },
        mounted() {
            Utils.makeScrollBar("#scroll-box", {scrollInertia: 300, deltaFactor: 100, axis: "y"});
            //使用该函数初始化数据
            this.initIndexDBCompleted(true);
        },
        data() {
            return {
                /*侧边栏是否折叠所有目录*/
                collapseAll: FrontConfig.sideBarCollapse,

                /*侧边栏*/
                folderAlert: false,
                newFileName: "",
                newFolderOrPad: {
                    name:'',
                    type:'',
                    order:'',
                },
                alertTitle: null,
                alertWidth: 300,
                alertMsg: null,
                alertComponent: null,
                alertCallBackName: [],
                selectedState: {
                    styler: {},
                    folder: {}
                },
                openState:{},
                showSomeFolder:{},
                folders: [],
                colors: EventHub.colors,
   
                newPadName: "",

                /*type*/
                classify:EventHub.classify,
                orders:[],

            }
        },
        methods: {
            /*目录 CRUD*/
            newFolder() {
                this.alertTitle = "create folder";
                this.newFolderOrPad = {
                    name:'',
                    type:'',
                    order:'',
                },
                this.alertComponent = 'UpdatePadModal';
                this.alertWidth = 300;
                this.alertCallBackName = ['createFolderAlertOK', 'createFolderAlertCancel'];
                this.newFileName = null;
                this.folderAlert = true;

                this.orders = [];

                var parent = this.selectedState.folder.id != null ? this.selectedState.folder : {children: this.folders};
                EventHub.getOrders(this.selectedState.folder,this.orders,parent);
            },
            createFolderAlertOK() {
                if (!this.newFolderOrPad.name || !this.newFolderOrPad.name.trim())
                    this.newFolderOrPad.name = "UntitledFolder";

                var newFolder = this.newFolderOrPadObj("Folder");

                var parent = this.selectedState.folder.name ? this.selectedState.folder:{ children:this.folders};
                parent.isStretch = true;

                 var order = this.newFolderOrPad.order;

                newFolder.parentId = parent.id;
                newFolder.name = this.newFolderOrPad.name;
                newFolder.type =  this.newFolderOrPad.type.name;
                newFolder.beCreate = true;

                if(!order)
                    parent.children.push(newFolder);
                else
                    EventHub.insertPad(newFolder,parent,order.id);      //插入目录或Pad到指定的位置
                
                this.folderAlert = false;

                /*** Persistence Data ***/
                PadsService.put(EventHub,{successful:"新建文件夹成功!",unsuccessful:"新建文件夹失败!"});
                /*** Persistence Data ***/
            },
            createFolderAlertCancel() {
                this.folderAlert = false;
            },

            delFolder() {
                this.alertTitle = "delete folder";
                this.alertComponent = 'deleteFolderOrPad';
                this.alertWidth = 175;
                if (this.selectedState.folder.name && this.selectedState.folder.children.length == 0){
                    this.alertMsg = "确定删除!";
                    this.alertCallBackName = ['deleteFolderAlertOK', 'deleteFolderAlertCancel']
                    this.folderAlert = true;
                }
                else{
                    EventHub.$emit('goTip',["请选择一个空文件夹",false,3000]);
                }
            },
            deleteFolderAlertOK() {
                if (this.selectedState.folder.name && this.selectedState.folder.children.length != 0){
                    this.folderAlert = false;
                    return;
                }
                var id = this.selectedState.folder.id;
                var children = this.folders;
                this.deletedFolder(children,id);

                /*** Persistence Data ***/
                PadsService.put(EventHub,{successful:"删除文件夹成功!",unsuccessful:"删除文件夹失败!"});
                /*** Persistence Data ***/

                this.selectedState.folder = {}
                this.folderAlert = false;
            },
            deleteFolderAlertCancel() {
                this.folderAlert = false;
            },

            updateFolder() {
                this.alertTitle = "edit folder";
                this.alertWidth = 300;
                this.alertCallBackName = ['editFolderAlertOK', 'editFolderAlertCancel'];
                this.folderAlert = true;
                if (!this.selectedState.folder.name){
                    this.alertComponent = 'deleteFolderOrPad';
                    this.alertMsg = "你还没有选择文件夹!";
                }else{
                    this.alertComponent = 'UpdatePadModal';
                    this.newFileName = this.selectedState.folder.name;

                    this.orders = [];

                    var parent = EventHub.getPadParent(this.selectedState.folder);
             
                    EventHub.getOrders(this.selectedState.folder,this.orders,parent);
                    EventHub.getTypes(this.selectedState.folder);
                }
            },
            editFolderAlertOK() {
                if (this.selectedState.folder.name){
                    this.selectedState.folder.name = this.newFolderOrPad.name;
                    this.selectedState.folder.type = this.newFolderOrPad.type?this.newFolderOrPad.type.name:null;
                    //交换位置
                    if(this.newFolderOrPad.order && this.newFolderOrPad.order.id != this.selectedState.folder.id)
                        EventHub.interchange(this.selectedState.folder,this.newFolderOrPad.order.id);
                }

                /*** Persistence Data ***/
                PadsService.put(EventHub,{successful:"修改文件夹成功!",unsuccessful:"修改文件夹失败!"});
                /*** Persistence Data ***/

                this.folderAlert = false;
            },
            editFolderAlertCancel() {
                this.folderAlert = false;
            },

            /*pad CRUD*/
            addPad() {
                this.alertTitle = "create pad";
                this.newFolderOrPad = {
                    name:'',
                    type:'',
                    order:'',
                },
                this.alertCallBackName = ['addPadAlertOK', 'addPadAlertCancel'];
                this.folderAlert = true;
                this.alertWidth = 300;
                this.alertComponent = 'UpdatePadModal';
                this.newFileName = null;
                this.orders = [];
                if(this.selectedState.folder.name){
                    EventHub.getOrders(this.selectedState.folder,this.orders,this.selectedState.folder);
                }else{
                    EventHub.getOrders(this.selectedState.folder,this.orders,EventHub.defaultFolder);
                }
                EventHub.getTypes(this.selectedState.folder);
            },
            addPadAlertOK() {
                var parent = this.selectedState.folder.id?this.selectedState.folder:EventHub.defaultFolder;
                parent.isStretch = true;

                var newPad = this.newFolderOrPadObj();
                newPad.name = this.newFolderOrPad.name ||  "untitled_pad";
                newPad.type = this.newFolderOrPad.type.name;
                newPad.parentId = parent.id;
                newPad.editable = true;

                var order = this.newFolderOrPad.order;

                EventHub.insertPad(newPad,parent,order?order.id:null);
                if(parent.id === EventHub.defaultFolderId){
                     parent.isShow = true;
                }

                EventHub.$emit('addPadCard', newPad);
                this.folderAlert = false;

                /*** Persistence Data ***/
                PadsService.put(EventHub,{successful:"新建pad成功!",unsuccessful:"新建pad失败!"});
                /*** Persistence Data ***/
            },
            addPadAlertCancel() {
                this.folderAlert = false;
            },

            /*Helper*/
            newFolderOrPadObj(type) {
                return {
                    parentId: null,
                    id: Utils.UUID2(8,16),
                    name: type === "Folder" ? this.newFileName : this.newPadName,
                    isShow: true,
                    isStretch: true,
                    isChecked: false,
                    children: type === "Folder" ? [] : null,
                    createTime:Utils.simpleDateFormat(new Date()),
                    updateTime:Utils.simpleDateFormat(new Date())
                };
            },
            deletedFolder(folders, delId) {
                for (var i = 0; i < folders.length; i++) {
                    if (delId == folders[i].id) {
                        folders.splice(i, 1);
                        return true;
                    } else {
                        if (folders[i].children != null && folders[i].children.length > 0) {
                            this.deletedFolder(folders[i].children, delId);
                        }
                    }
                }
            },

            /****************** Index BD **********************/
            initIndexDBCompleted(isCompleted){
                if(isCompleted){
                    var that = this;
                    PadsService.get("folderRoot").then(function (data) {
                        if(data && data.folders){
                            EventHub.folders = data.folders;
                            EventHub.folderRoot.folders = data.folders;

                            that.folders = data.folders;

                            EventHub.folders.forEach(function (folder) {
                                if(folder.id === EventHub.defaultFolderId)
                                    EventHub.defaultFolder = folder;
                            });
                            EventHub.$emit("initFolderPropCompleted");
                        }
                    }).catch(function (err) {
                        console.err(err);
                        EventHub.$emit('goTip',["获取目录失败!",false])
                    });
                }else{
                    EventHub.$emit('goTip',["获取目录失败!",false])
                }
            },
        },
        watch: {},
        created: function () {
            EventHub.$on('initIndexDBCompleted', this.initIndexDBCompleted);
        },
        beforeDestroy: function () {
            EventHub.$off('initIndexDBCompleted', this.initIndexDBCompleted);
        },
    }
</script>

