module.exports = {
  displayName: 'mdns',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': '@swc/jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/mdns',
}
