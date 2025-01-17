import { screen } from '@testing-library/vue'
import type { Mock } from 'vitest'
import { expect, it } from 'vitest'
import { userStore } from '@/stores/userStore'
import UnitTestCase from '@/__tests__/UnitTestCase'
import RegisterForm from './RegisterForm.vue'

new class extends UnitTestCase {
  private async submitForm (loginMock: Mock) {
    const rendered = this.render(RegisterForm)

    await this.type(screen.getByPlaceholderText('Email Address'), 'john@doe.com')
    await this.type(screen.getByPlaceholderText('Password'), 'secret')
    await this.user.click(screen.getByRole('button', { name: 'Log In' }))

    expect(loginMock).toHaveBeenCalledWith('john@doe.com', 'secret')

    return rendered
  }

  protected test () {
    it('renders', () => expect(this.render(RegisterForm).html()).toMatchSnapshot())

    it('register', async () => {
      expect((await this.submitForm(this.mock(userStore, 'register'))).emitted().registeredin).toBeTruthy()
    })

    it('fails to register', async () => {
      const mock = this.mock(userStore, 'register').mockRejectedValue(new Error('Unauthenticated'))
      const { emitted } = await this.submitForm(mock)
      await this.tick()

      expect(emitted().registeredin).toBeFalsy()
      expect(screen.getByTestId('register-form').classList.contains('error')).toBe(true)
    })
  }
}
