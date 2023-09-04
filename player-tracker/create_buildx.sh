#!/bin/bash
if ! docker buildx ls | grep -q 'erep_tracker_builder'; then
    docker buildx create --name erep_tracker_builder
fi
docker buildx use erep_tracker_builder
docker buildx inspect --bootstrap
