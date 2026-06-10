# Material Sync

TypeScript-based scripts for synchronizing teaching materials and documentation versions.

## Scripts

- `sync` - Sync materials according to configuration
- `sync:secure` - Sync secure pages and static files
- `add` - Add new material to versioning config
- `remove` - Remove material from versioning config
- `cleanup` - Cleanup temporary files
- `restore` - Restore backed-up docs

## Configuration

Configuration is defined in `material_config.yaml`. Each class version has a list of source folders to sync with their destination paths and ignore patterns.

## Usage

```bash
# Run from project root
yarn workspace @tdev/material-sync sync

# Or run directly from materialSync folder
cd materialSync
yarn sync
```
