#!/bin/bash

SESSION_NAME="ps8"
SERVICES=("gateway" "gamesvc" "files")

tmux new-session -d -s $SESSION_NAME

tmux send-keys -t $SESSION_NAME:0.0 "cd services/${SERVICES[0]} && npm run watch" C-m

for i in "${!SERVICES[@]}"; do
    if [[ $i -eq 0 ]]; then
        continue
    fi

    if [[ $i -eq 1 ]]; then
        tmux split-window -h -t $SESSION_NAME:0.0
    else
        tmux split-window -v -t $SESSION_NAME:0.$((i-1))
    fi

    tmux send-keys -t $SESSION_NAME:0.$i "cd services/${SERVICES[i]} && npm run watch" C-m
done

tmux attach -t $SESSION_NAME
