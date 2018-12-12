# 뷰-클래스-컴포넌트

> 클래스 스타일 Vue 구성 요소 용 ECMAScript / TypeScript 데코레이터입니다.

[![npm](https://img.shields.io/npm/v/vue-class-component.svg)](https://www.npmjs.com/package/vue-class-component)

### 사용법

**필수**: [ECMAScript stage 1 데코레이터](https://github.com/wycats/javascript-decorators/blob/master/README.md).
Babel 사용한다면, [babel-plugin-transform-decorators-legacy](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy) 필요.
TypeScript 사용한다면, `--experimentalDecorators` 플래그 활성화.

> 주류의 트랜스파일러는 여전히 오래된 데코레이터로 트랜스파일하기 때문에 2 단계 데코레이터는 지원하지 않습니다.

노트:

1. `methods` 는 클래스 멤버 메소드로 직접 선언될 수 있습니다.

2. Computed 속성은 클래스 속성 접근자로 선언될 수 있습니다.

3. 초기 `data` 는 클래스 속성으로 선언될 수 있습니다.(바벨 사용한다면 [babel-plugin-transform-class-properties](https://babeljs.io/docs/plugins/transform-class-properties/) 이 필수입니다).

4. `data`, `render` 그리고 모든 뷰 생명주기 훅은 직접 클래스 멤버 메소드로 선언될 수 있지만, 인스턴스 스스로에서 그것들을 호출할 수는 없습니다. 사용자 정의 메소드를 선언할 때, 이 예약된 이름들을 피해야 합니다.

5. 모든 다른 옵션들은, 데코레이터 함수로 통과시키십시오.

### 예시

다음 예시는 Babel로 작성됐습니다. TypeScript 버전을 원한다면, [예시 디렉토리에 있습니다](example/src/App.vue).

``` vue
<template>
  <div>
    <input v-model="msg">
    <p>prop: {{propMessage}}</p>
    <p>msg: {{msg}}</p>
    <p>helloMsg: {{helloMsg}}</p>
    <p>computed msg: {{computedMsg}}</p>
    <button @click="greet">Greet</button>
  </div>
</template>

<script>
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  // 프롭스는 컴포넌트 데코레이터 함수를 통과시켜야 함
  props: {
    propMessage: String
  }
})
export default class App extends Vue {
  // 초기 데이터 - data(){ return {}} 대신 직접 선언
  msg = 123

  // 데코레이터 함수를 통과한 프롭 데이터를 사용한다.
  helloMsg = 'Hello, ' + this.propMessage

  // 생명주기 훅
  mounted () {
    this.greet()
  }

  // computed 속성 - computed: {} 대신 직접 선언
  get computedMsg () {
    return 'computed ' + this.msg
  }

  // 메소드 - methods: {} 대신 직접 선언
  greet () {
    alert('greeting: ' + this.msg)
  }
}
</script>
```

당신은 또한 [vue-property-decorators](https://github.com/kaorun343/vue-property-decorator)로 제공되는 `@prop` 와 `@watch` 데코레이터를 확인하기 원할겁니다. 

### 믹스인 사용하기

뷰-클래스-컴포넌트는 `mixins` 헬퍼 함수를 클래스 스타일 매너에서 [mixins](https://vuejs.org/v2/guide/mixins.html) 를 사용하기 위해 제공합니다. `mixins` 도우미를 사용함으로써, TypeScript 는 믹스인 타입을 추론하고 컴포넌트 타입으로부터 그것들을 상속할 수 있습니다.

믹스인 선언하기 예시:

``` js
// mixin.js
import Vue from 'vue'
import Component from 'vue-class-component'

// 컴포넌트와 같은 스타일로 믹스인을 선언할 수 있습니다.
@Component
export default class MyMixin extends Vue {
  mixinValue = 'Hello'
}
```

mixin 사용 예:

``` js
import Component, { mixins } from 'vue-class-component'
import MyMixin from './mixin.js'

// `Vue` 대신 Use `mixins` 헬퍼 함수를 사용하세요.
// `mixins` 은 어떤 개수의 인수도 받을 수 있습니다.
@Component
export class MyComp extends mixins(MyMixin) {
  created () {
    console.log(this.mixinValue) // -> Hello
  }
}
```

### 사용자 정의 데코레이터 만들기

자체 데코레이터를 만들어이 라이브러리의 기능을 확장 할 수 있습니다. 뷰-클래스-컴포넌트는 `createDecorator` 헬퍼를 제공하여 커스텀 데코레이터를 생성합니다. `createDecorator`는 첫번째 인자로 콜백 함수를 기대하며 콜백은 다음 인자를받습니다 :

- `options`: Vue 구성 요소 옵션 객체. 이 개체에 대한 변경 사항은 제공된 구성 요소에 영향을줍니다.
- `key`: 데코레이터가 적용된 속성 또는 메서드 키입니다.
- `parameterIndex`: 사용자 정의 데코레이터가 인수로 사용 된 경우 데코 레이팅 된 인수의 인덱스입니다.

`NoCache` 데코레이터 선언 예:

``` js
// decorators.js
import { createDecorator } from 'vue-class-component'

export const NoCache = createDecorator((options, key) => {
  // component options should be passed to the callback
  // and update for the options object affect the component
  // 컴포넌트 옵션은 콜백으로 통과될 수 있다
  // 그리고 옵션객체의 업데이트는 컴포넌트트에 영향을 미친다.
  options.computed[key].cache = false
})
```

``` js
import { NoCache } from './decorators'

@Component
class MyComp extends Vue {
  // 계산된 속성은 캐시되지 않을 것이다.
  @NoCache
  get random () {
    return Math.random()
  }
}
```

### 사용자 정의 후크 추가

뷰 라우터 같은 뷰 플러그인을 사용한다면, 그것들이 제공하는 훅을 해결하는 클래스 컴포넌트를 원할 것이다. 이경우, 'Component.registerHooks`는 그러한 훅을 등록 할 수있게 해줍니다 :

```js
// class-component-hooks.js
import Component from 'vue-class-component'

// 라우터 훅을 그것들의 이름으로 등록한다.
Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteLeave',
  'beforeRouteUpdate' // 뷰-라우터 2.2+
])
```

```js
// MyComp.js
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
class MyComp extends Vue {
  // 클래스 컴포넌트튼 이제 beforeRouteEnter 그리고
  // beforeRouteLeave 를 뷰 라우터 훅으로 다룰 수 있다. 
  beforeRouteEnter (to, from, next) {
    console.log('beforeRouteEnter')
    next() // 탐색을 확인하기위해 호출될 필요가 있다.
  }

  beforeRouteLeave (to, from, next) {
    console.log('beforeRouteLeave')
    next() // 탐색을 확인하기 위해 호출해야합니다.
  }
}
```

컴포넌트 정의하기 전에 훅을 등록해야합니다.

```js
// main.js

// 어떤 컴포넌트를 임포트하기 전에 등록해야합니다.
import './class-component-hooks'

import Vue from 'vue'
import MyComp from './MyComp'

new Vue({
  el: '#app',
  components: {
    MyComp
  }
})
```

### 클래스 속성 주의사항

vue-class-component는 원본 생성자를 인스턴스화하여 클래스 속성을 Vue 인스턴스 데이터로 수집합니다. 네이티브 클래스 방식과 같은 인스턴스 데이터를 정의 할 수 있지만 때때로 작동 방식을 알아야합니다.

#### 속성에서 `this` 값

화살표 함수를 클래스 프로퍼티로 정의하고 거기에`this`를 억세스하면 작동하지 않습니다. 이것은`this`가 클래스 프로퍼티를 초기화 할 때 Vue 인스턴스에 대한 프록시 객체 일 뿐이기 때문입니다 :

```js
@Component
class MyComp extends Vue {
  foo = 123

  bar = () => {
    // 속성을 기대대로 업데이트하지 못한다.
    // `this` 값은 사실 뷰 인스턴스가 아니다.
    this.foo = 456
  }
}
```

Vue가 인스턴스를 자동으로 바인딩하기 때문에 클래스 속성 대신 메소드를 정의 할 수 있습니다.

```js
@Component
class MyComp extends Vue {
  foo = 123

  bar () {
    // 기대되는 속성에 제대로 값을 업데이트한다.
    this.foo = 456
  }
}
```

#### `undefined` 는 리액티브 되지 않는다

Babel과 TypeScript의 데코레이터 동작간에 일관성을 유지하기 위해 vue-class-component는 초기 값으로 `undefined` 이있는 속성을 반응적으로 만들지 않습니다. `null` 을 초기 값으로 사용하거나`data` hook을 사용하여`undefined` 속성을 초기화해야합니다.

```js
@Component
class MyComp extends Vue {
  // 반응적이게 되지 않는다.
  foo = undefined

  // 반응적이게 된다.
  bar = null

  data () {
    return {
      // 반응적이게 된다.
      baz: undefined
    }
  }
}
```

### 예제 빌드

``` bash
$ npm install && npm run example
```

### 질문

질문이나 지원은 [공식 포럼](http://forum.vuejs.org) 이나 [커뮤니티 챗](https://chat.vuejs.org/)을 이용해주세요. 이 저장소의 이슈 목록은 버그 보고나 기능 요청을 위해 **독점적**입니다.

### 라이센스

[MIT](http://opensource.org/licenses/MIT)
