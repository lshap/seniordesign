{
    'targets': [
      {
        'target_name': 'test',
        'type': 'executable',
        'msvs_guid': '5ECEC9E5-8F23-47B6-93E0-C3B328B3BE65',
        'dependencies': [
          'xyzzy',
          '../bar/bar.gyp:bar',
        ],
        'defines': [
          'DEFINE_FOO',
          'DEFINE_A_VALUE=value',
        ],
        'include_dirs': [
          '..',
        ],
        'sources': [
          'file1.cc',
          'file2.cc',
        ],
        'conditions': [
          ['OS=="linux"', {
            'defines': [
              'LINUX_DEFINE',
            ],
            'include_dirs': [
              'include/linux',
            ],
          }],
          ['OS=="win"', {
            'defines': [
              'WINDOWS_SPECIFIC_DEFINE',
            ],
          }, { # OS != "win",
            'defines': [
              'NON_WINDOWS_DEFINE',
            ],
          }]
        ],
      },
    ],
  }
