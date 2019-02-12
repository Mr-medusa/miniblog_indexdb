import './assets/fonts/a_calling_font_d_by_7ntypes-webfont.woff'
import './assets/fonts/a_calling_font_d_by_7ntypes-webfont.woff2'
import './assets/fonts/inconsolata-webfont.woff'
import './assets/fonts/inconsolata-webfont.woff2'
import './assets/fonts/obelixpro-broken-cyr-webfont.woff'
import './assets/fonts/obelixpro-broken-cyr-webfont.woff2'
import './assets/css/normalize.css'
import './assets/css/util.css'
import './assets/css/hover.css'


import Vue from 'vue'
import Frame from './Frame.vue'
import operateTip from './components/modal/OperateTip'
import miniSelect from './components/widget/miniSelect'

import EventHub from "./utils/EventHub"
import FrontConfig from "./config/FrontConfig"
import db from "./indexDB/DataSource"

import router from './router'


Vue.config.productionTip = false;

Vue.component('OperateTip', operateTip);
Vue.component('miniSelect', miniSelect);

Vue.filter('dateToLocalTime', function (date) {
    if (date instanceof Date)
        return date.toLocaleDateString();
    return date;
});

router.beforeEach((to, from, next) => {
    if (to.path !== "/delete_miniblog_db") {
        Dexie.exists(FrontConfig.dbName).then(function (exists) {
            if (!exists) {
                EventHub.$emit('goTip', ["请刷新初始化数据库!", false]);
                next(false);
            } else {
                next();
            }
        });
    } else {
            Dexie.exists(FrontConfig.dbName).then(function (isTrue) {
                if (isTrue) {
                    db.close();
                    Dexie.delete(FrontConfig.dbName).then(() => {
                        EventHub.$emit('goTip', ["删除数据库成功!"]);
                    }).catch((err) => {
                        console.log(err);
                        EventHub.$emit('goTip', ["删除数据库失败!", false]);
                    }).finally(() => {
                          next();
                    });
                }
            });
    }
});

new Vue({
    router,
    render: h => h(Frame),
}).$mount('#app');
