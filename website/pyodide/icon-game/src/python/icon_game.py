"""Icon scenes for Teaching Dev's Pyodide renderer."""

from _icon_game_bridge import use_scene

__all__ = ['use_scene', 'was_clicked']


def was_clicked(ctx):
    """Return the latest icon-scene click of this frame, or None without a click.

    The click is truthy and provides its scene coordinates as `click.x` and `click.y`.
    """
    clicks = [
        event for event in ctx.events
        if event.type == 'click' and event.extension == 'icon_game'
    ]
    return clicks[-1] if clicks else None
