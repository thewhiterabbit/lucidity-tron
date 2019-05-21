<template>
    <monaco-editor
    class="editor"
    v-model="sourceCode"
    language="sol"
    theme="vs-dark"
    :options="options"
    @change="updateCode">
  </monaco-editor>
</template>
<script>
    import MonacoEditor from 'vue-monaco'
    export default {
        data() {
            return {
                sourceCode:this.value,
                options:{automaticLayout: true, fontSize: 12}
            }
        },
        watch:{
            value:function(val){
                this.sourceCode=val;
            }
        },
        components: { MonacoEditor },
        props: {
            value: String,
        },
        methods: {
           updateCode:function(val){
               this.$emit('input', val)
           }
        }
    }
</script>
<style>
.editor {
  width: 100%;
  height: 100%;
}
</style>