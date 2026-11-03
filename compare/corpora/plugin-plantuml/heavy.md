@startuml
Alice -> Bob : hello
Bob -> Carol : forward
note right: handled
@enduml

@startuml
Client -> Server : request
Server -> Client : response
@enduml

@startuml
A -> B
B -> C
C -> A
@enduml

@startuml
start
:collect input;
stop
@enduml

