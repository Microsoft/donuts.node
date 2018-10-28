{
    'targets': [{
        'target_name': 'weak-reference',
        'sources': ['weak-reference.cc'],
        'include_dirs': ['<!(node -e "require(\'nan\')")']
    }]
}