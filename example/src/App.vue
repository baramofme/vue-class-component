<template>
  <div>
    <input v-model="msg">
    <p>prop: {{ propMessage }}</p>
    <p>msg: {{ msg }}</p>
    <p>helloMsg: {{ helloMsg }}</p>
    <p>computed msg: {{ computedMsg }}</p>
    <!-- dom 참조 걸기 -->
    <Hello ref="helloComponent" />
    <World />

    <p>
      <button @click="greet">Greet</button>
    </p>

    <p>
      Clicked: {{ count }} times
      <button @click="increment">+</button>
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from '../../lib/index'
import Hello from './components/Hello.vue'
import World from './components/World'
import { mapState, mapMutations } from 'vuex'

// props 를 따로 선언하는데, 타입 추론이 가능하게 하기 위해서
const AppProps = Vue.extend({
  props: {
    propMessage: String
  }
})

@Component({
  components: {
    Hello,
    World
  },

  // Vuex's 컴포넌트 바인딩 헬터가 여기에 사용될 수 있다.
  computed: mapState([
    'count'
  ]),
  methods: mapMutations([
    'increment'
  ])
})
export default class App extends AppProps {
  // 초기 데이터 - 클래스의 속성은 뷰의 data() 로 간주된다.
  msg: number = 123

  // prop 값을 초기 자료료 사용한다.
  helloMsg: string = 'Hello, ' + this.propMessage

  // refs 타입 annotate
  $refs!: {
    helloComponent: Hello
  }

  // `Component` 데코레이터에서 정의한 속성의 경우에는,
  // 클래스 내부에서 추가적인 (타입)정의가 필요하다.
  count!: number
  increment!: () => void

  // 생명주기 훅
  mounted () {
    this.greet()
  }

  // computed 속성
  get computedMsg () {
    return 'computed ' + this.msg
  }

  // 클래스의 메서드도 뷰의 메서드로 간주된다.
  greet () {
    alert('greeting: ' + this.msg)
    this.$refs.helloComponent.sayHello()
  }

  // 직접 디스패치 예시
  incrementIfOdd () {
    this.$store.dispatch('incrementIfOdd')
  }
}
</script>
