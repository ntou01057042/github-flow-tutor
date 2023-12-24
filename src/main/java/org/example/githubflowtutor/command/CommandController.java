package org.example.githubflowtutor.command;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/commands")
public class CommandController {
    private final CommandService service;

    @Autowired
    public CommandController(CommandService service) {
        this.service = service;
    }

    @DeleteMapping
    public ResponseEntity<Void> initialize(@RequestBody Command command) {
        service.deleteAllCommands();
        service.insertCommand(command);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Command>> getAllCommands() {
        List<Command> commands = service.findAllCommands();
        return ResponseEntity.ok(commands);
    }

    @PostMapping("/push")
    public ResponseEntity<Void> postCommands(@RequestBody List<Command> commands) {
        service.insertCommands(commands);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<Void> postCommand(@RequestBody Command command) {
        service.insertCommand(command);
        return ResponseEntity.ok().build();
    }
}
