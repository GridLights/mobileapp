import { mount } from '@vue/test-utils'
import SettingsPage from '../SettingsPage.vue'

// Mock the webservices module
jest.mock('../../webservices', () => ({
  __esModule: true,
  default: {
    initWebSocket: jest.fn(),
    closeWebSocket: jest.fn(),
    unsubscribeFromLiveStream: jest.fn(),
    subscribeToLiveStream: jest.fn(),
  },
}))

// Mock router
const mockRouter = {
  push: jest.fn(),
}

describe('SettingsPage', () => {
  let wrapper

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    jest.clearAllMocks()

    wrapper = mount(SettingsPage, {
      global: {
        mocks: {
          $router: mockRouter,
        },
        stubs: {
          QPage: { template: '<div><slot /></div>' },
          QIcon: { template: '<i />' },
          QBtn: { template: '<button><slot /></button>' },
          QInput: {
            template: '<input />',
            props: ['modelValue'],
            emits: ['update:modelValue']
          },
        },
      },
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('should mount successfully', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('should display the settings header', () => {
    const header = wrapper.find('.header-title')
    expect(header.text()).toBe('SETTINGS')
  })

  it('should display default WLED devices', () => {
    const devices = wrapper.findAll('.wled-device-item')
    expect(devices.length).toBe(3)
  })

  it('should select a device when clicked', async () => {
    const deviceInfo = wrapper.findAll('.device-info')[1]
    await deviceInfo.trigger('click')

    // Check that the second device is now selected
    const selectedDevices = wrapper.findAll('.wled-device-item.selected')
    expect(selectedDevices.length).toBeGreaterThan(0)
  })

  it('should save IP address to localStorage', async () => {
    // Set the ipAddress directly via the component
    wrapper.vm.ipAddress = '192.168.1.200'
    await wrapper.vm.$nextTick()

    // Call the save method directly
    wrapper.vm.saveIpAddress()

    expect(localStorage.getItem('ipAddress')).toBe('192.168.1.200')
  })

  it('should load saved IP from localStorage on mount', () => {
    localStorage.setItem('ipAddress', '192.168.1.50')

    const newWrapper = mount(SettingsPage, {
      global: {
        mocks: {
          $router: mockRouter,
        },
        stubs: {
          QPage: { template: '<div><slot /></div>' },
          QIcon: { template: '<i />' },
          QBtn: { template: '<button><slot /></button>' },
          QInput: {
            template: '<input />',
            props: ['modelValue'],
            emits: ['update:modelValue']
          },
        },
      },
    })

    expect(newWrapper.vm.ipAddress).toBe('192.168.1.50')
    newWrapper.unmount()
  })

  it('should navigate back when back arrow is clicked', async () => {
    const backButton = wrapper.find('.left-icon')
    await backButton.trigger('click')

    expect(mockRouter.push).toHaveBeenCalledWith('/')
  })

  it('should add a new WLED device', async () => {
    // Set the input values directly
    wrapper.vm.newDeviceName = 'Test Device'
    wrapper.vm.newDeviceIp = '192.168.1.150'
    await wrapper.vm.$nextTick()

    // Call the add method directly
    wrapper.vm.addWledDevice()
    await wrapper.vm.$nextTick()

    const devices = wrapper.findAll('.wled-device-item')
    expect(devices.length).toBe(4)
  })

  it('should display network settings section', () => {
    const sections = wrapper.findAll('.settings-section')
    expect(sections.length).toBeGreaterThan(0)

    const networkSection = sections[0]
    expect(networkSection.text()).toContain('Wi-Fi / Network Settings')
  })

  it('should display firmware information', () => {
    const firmwareVersion = wrapper.find('.firmware-version')
    expect(firmwareVersion.text()).toBe('WLED 0.14.1')

    const appVersion = wrapper.find('.version-number')
    expect(appVersion.text()).toBe('v2.10')
  })
})
