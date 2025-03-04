import isMobile from 'ismobilejs'
import { isObject, mergeWith } from 'lodash'
import type { RenderOptions } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import type { UserEvent } from '@testing-library/user-event/dist/types/setup/setup'
import type { EventType } from '@testing-library/dom/types/events'
import { cleanup, createEvent, fireEvent, render } from '@testing-library/vue'
import { afterEach, beforeEach, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import factory from '@/__tests__/factory'
import { DialogBoxStub, MessageToasterStub, OverlayStub } from '@/__tests__/stubs'
import { commonStore } from '@/stores/commonStore'
import { userStore } from '@/stores/userStore'
import { http } from '@/services/http'
import { DialogBoxKey, MessageToasterKey, OverlayKey, RouterKey } from '@/symbols'
import Router from '@/router'

// A deep-merge function that
// - supports symbols as keys (_.merge doesn't)
// - supports Vue's Ref type without losing reactivity (deepmerge doesn't)
// Credit: https://stackoverflow.com/a/60598589/794641
const deepMerge = (first: object, second: object) => {
  return mergeWith(first, second, (a, b) => {
    if (!isObject(b)) {
      return b
    }

    // @ts-ignore
    return Array.isArray(a) ? [...a, ...b] : { ...a, ...b }
  })
}

const setPropIfNotExists = (obj: object | null, prop: any, value: any) => {
  if (!obj) {
    return
  }

  if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
    obj[prop] = value
  }
}

export default abstract class UnitTestCase {
  protected router: Router
  protected user: UserEvent
  private backupMethods = new Map()

  public constructor () {
    this.router = new Router()
    this.mock(http, 'request') // prevent actual HTTP requests from being made
    this.user = userEvent.setup({ delay: null }) // @see https://github.com/testing-library/user-event/issues/833

    this.setReadOnlyProperty(navigator, 'clipboard', {
      writeText: vi.fn(),
    })

    this.beforeEach()
    this.afterEach()
    this.test()
  }

  protected beforeEach (cb?: Closure) {
    beforeEach(() => {
      commonStore.state.song_length = 10
      commonStore.state.allows_download = true
      commonStore.state.uses_i_tunes = true
      commonStore.state.supports_batch_downloading = true
      commonStore.state.supports_transcoding = true
      cb?.()
    })
  }

  protected afterEach (cb?: Closure) {
    afterEach(() => {
      isMobile.any = false
      commonStore.state.song_length = 10
      cleanup()
      this.restoreAllMocks()
      cb?.()
    })
  }

  protected auth (user?: User) {
    return this.be(user)
  }

  protected be (user?: User) {
    userStore.state.current = user || factory('user')
    return this
  }

  protected beAdmin () {
    return this.be(factory.states('admin')('user'))
  }

  protected mock<T, M extends MethodOf<Required<T>>> (obj: T, methodName: M, implementation?: any) {
    const mock = vi.fn()

    if (implementation !== undefined) {
      mock.mockImplementation(implementation instanceof Function ? implementation : () => implementation)
    }

    this.backupMethods.set([obj, methodName], obj[methodName])

    // @ts-ignore
    obj[methodName] = mock

    return mock
  }

  protected restoreAllMocks () {
    this.backupMethods.forEach((fn, [obj, methodName]) => (obj[methodName] = fn))
    this.backupMethods = new Map()
  }

  protected render (component: any, options: RenderOptions = {}) {
    return render(component, deepMerge({
      global: {
        directives: {
          'charon-focus': {},
          'charon-tooltip': {},
          'charon-hide-broken-icon': {},
          'charon-overflow-fade': {},
        },
        components: {
          Icon: this.stub('Icon'),
        },
      },
    }, this.supplyRequiredProvides(options)))
  }

  protected stub (testId = 'stub') {
    return defineComponent({
      template: `<br data-testid="${testId}"/>`,
    })
  }

  protected async tick (count = 1) {
    for (let i = 0; i < count; ++i) {
      await nextTick()
    }
  }

  protected setReadOnlyProperty<T> (obj: T, prop: keyof T, value: any) {
    return Object.defineProperties(obj, {
      [prop]: {
        value,
        configurable: true,
      },
    })
  }

  protected async type (element: HTMLElement, value: string) {
    await this.user.clear(element)
    await this.user.type(element, value)
  }

  protected async trigger (element: HTMLElement, key: EventType | string, options: object = {}) {
    await fireEvent(element, createEvent[key](element, options))
  }

  protected abstract test ()

  private supplyRequiredProvides (options: RenderOptions) {
    options.global = options.global || {}
    options.global.provide = options.global.provide || {}

    setPropIfNotExists(options.global.provide, DialogBoxKey, DialogBoxStub)
    setPropIfNotExists(options.global.provide, MessageToasterKey, MessageToasterStub)
    setPropIfNotExists(options.global.provide, OverlayKey, OverlayStub)
    setPropIfNotExists(options.global.provide, RouterKey, this.router)

    return options
  }
}
