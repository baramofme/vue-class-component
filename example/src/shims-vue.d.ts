// 싱글 vue 파일을 타입스크립트에서 컴파일 하기 위해서
// 모듈을 선언
declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}
