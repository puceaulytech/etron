#!/bin/bash

SESSION_NAME="ps8"
SERVICES=("gateway" "gamesvc" "files")

BASEDIR=$(dirname "$0")

# Create a new tmux session, but do not attach
tmux new-session -d -s $SESSION_NAME

# Start the first service in the first pane
tmux send-keys -t $SESSION_NAME:0.0 "cd $BASEDIR/../services/${SERVICES[0]} && npm run watch" C-m

# Loop through the rest of the services and create a grid
for i in "${!SERVICES[@]}"; do
    # Skip the first service (already running)
    if [[ $i -eq 0 ]]; then
        continue
    fi

    # Split horizontally for even indices, vertically for odd indices
    if [[ $((i % 2)) -eq 0 ]]; then
        tmux split-window -h -t $SESSION_NAME
    else
        tmux split-window -v -t $SESSION_NAME
    fi

    # Navigate to the service directory and run the watch command
    tmux send-keys -t $SESSION_NAME "cd $BASEDIR/../services/${SERVICES[i]} && npm run watch" C-m
done

# Arrange the panes into an even grid
tmux select-layout -t $SESSION_NAME tiled

# Attach to the tmux session
tmux attach -t $SESSION_NAME
